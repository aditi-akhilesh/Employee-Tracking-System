<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Employee Dashboard";

// Fetch employee_id from session
$employee_id = $_SESSION['employee_id'];

// Helper function to fetch data with error handling
function fetchData($con, $query, $params = [], $errorMessage) {
    try {
        $stmt = $con->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $_SESSION['error'] = $errorMessage . ": " . $e->getMessage();
        return [];
    }
}

// Handle AJAX requests for Attendance and Leave
if (isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    try {
        if ($_POST['action'] === 'mark_attendance') {
            $check_in = $_POST['check_in'] ?? null;
            $check_out = $_POST['check_out'] ?? null;
            $status = $_POST['status'] ?? 'present';

            // Validate inputs
            if (!$check_in) {
                $response['error'] = "Check-in time is required.";
                echo json_encode($response);
                exit;
            }

            // Insert attendance record
            $stmt = $con->prepare("
                INSERT INTO Attendance (employee_id, check_in, check_out, status)
                VALUES (?, ?, ?, ?)
            ");
            $success = $stmt->execute([$employee_id, $check_in, $check_out, $status]);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Attendance marked successfully.";
            } else {
                $response['error'] = "Failed to mark attendance.";
            }
        } elseif ($_POST['action'] === 'fetch_attendance') {
            $start_date = $_POST['start_date'] ?? '';
            $end_date = $_POST['end_date'] ?? '';

            $query = "
                SELECT 
                    a.attendance_id, a.check_in, a.check_out,
                    CASE 
                        WHEN a.status = 'present' THEN 'Present'
                        WHEN a.status = 'absent' THEN 'Absent'
                        ELSE a.status
                    END AS status
                FROM Attendance a
                WHERE a.employee_id = ?
            ";
            $params = [$employee_id];
            if ($start_date) {
                $query .= " AND DATE(a.check_in) >= ?";
                $params[] = $start_date;
            }
            if ($end_date) {
                $query .= " AND DATE(a.check_out) <= ?";
                $params[] = $end_date;
            }

            $attendance_records = fetchData($con, $query, $params, "Failed to fetch attendance");
            $response['attendance_records'] = $attendance_records;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'apply_leave') {
            $leave_type_id = $_POST['leave_type_id'] ?? null;
            $start_date = $_POST['start_date'] ?? null;
            $end_date = $_POST['end_date'] ?? null;

            // Validate inputs
            if (!$leave_type_id || !$start_date || !$end_date) {
                $response['error'] = "All fields are required.";
                echo json_encode($response);
                exit;
            }

            // Check leave balance
            $stmt = $con->prepare("
                SELECT total_days_allocated, days_used 
                FROM Leave_Balance 
                WHERE employee_id = ? AND leave_type_id = ?
            ");
            $stmt->execute([$employee_id, $leave_type_id]);
            $balance = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$balance) {
                $response['error'] = "Leave balance not found for this leave type.";
                echo json_encode($response);
                exit;
            }

            $days_requested = (strtotime($end_date) - strtotime($start_date)) / (60 * 60 * 24) + 1;
            $available_days = $balance['total_days_allocated'] - $balance['days_used'];

            if ($days_requested > $available_days) {
                $response['error'] = "Insufficient leave balance. Available days: $available_days.";
                echo json_encode($response);
                exit;
            }

            // Insert leave request
            $stmt = $con->prepare("
                INSERT INTO Leaves (employee_id, leave_type_id, leave_start_date, leave_end_date, status)
                VALUES (?, ?, ?, ?, 'pending')
            ");
            $success = $stmt->execute([$employee_id, $leave_type_id, $start_date, $end_date]);

            if ($success) {
                // Update leave balance
                $stmt = $con->prepare("
                    UPDATE Leave_Balance 
                    SET days_used = days_used + ?, last_updated = CURDATE()
                    WHERE employee_id = ? AND leave_type_id = ?
                ");
                $stmt->execute([$days_requested, $employee_id, $leave_type_id]);

                $response['success'] = true;
                $response['message'] = "Leave application submitted successfully.";
                $response['days_requested'] = $days_requested; // Return days requested for potential rollback
                $response['leave_type_id'] = $leave_type_id; // Return leave type for potential rollback
            } else {
                $response['error'] = "Failed to submit leave application.";
            }
        } elseif ($_POST['action'] === 'fetch_leave_requests') {
            $leave_filter = $_POST['leave_filter'] ?? 'pending';
            $leave_requests = fetchData($con, "
                SELECT 
                    l.leave_id, l.leave_start_date, l.leave_end_date, l.status, lt.leave_name
                FROM Leaves l
                JOIN Leave_Type lt ON l.leave_type_id = lt.leave_type_id
                WHERE l.employee_id = ? AND l.status = ?
            ", [$employee_id, $leave_filter], "Failed to fetch leave requests");
            $response['leave_requests'] = $leave_requests;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_leave_balance') {
            $leave_balances = fetchData($con, "
                SELECT 
                    lb.leave_type_id, lt.leave_name, lb.total_days_allocated, lb.days_used,
                    (lb.total_days_allocated - lb.days_used) AS remaining_days
                FROM Leave_Balance lb
                JOIN Leave_Type lt ON lb.leave_type_id = lt.leave_type_id
                WHERE lb.employee_id = ? AND lt.status = 'active'
            ", [$employee_id], "Failed to fetch leave balance");
            $response['leave_balances'] = $leave_balances;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_projects') {
            $query = "
                SELECT 
                    p.project_id, p.project_name, p.start_date, p.expected_end_date, 
                    p.project_status, p.budget, 
                    COALESCE((
                        SELECT COUNT(*) 
                        FROM Task t 
                        JOIN Assignment_Task at ON t.task_id = at.task_id 
                        WHERE t.project_id = p.project_id 
                        AND at.employee_id = ? 
                        AND t.status = 'completed'
                    ), 0) AS completed_tasks,
                    COALESCE((
                        SELECT COUNT(*) 
                        FROM Task t 
                        JOIN Assignment_Task at ON t.task_id = at.task_id 
                        WHERE t.project_id = p.project_id 
                        AND at.employee_id = ?
                    ), 0) AS total_tasks
                FROM Projects p
                JOIN Assignment a ON p.project_id = a.project_id
                WHERE a.employee_id = ?
            ";
            $projects = fetchData($con, $query, [$employee_id, $employee_id, $employee_id], "Failed to fetch projects");
            $response['projects'] = $projects;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_tasks') {
            $sort_by = $_POST['sort_by'] ?? 'due_date';
            $sort_order = $_POST['sort_order'] ?? 'ASC';
            $project_id = $_POST['project_id'] ?? '';

            $query = "
                SELECT 
                    t.task_id, t.task_description, t.status, at.due_date, 
                    p.project_name, p.project_id
                FROM Task t
                JOIN Assignment_Task at ON t.task_id = at.task_id
                JOIN Projects p ON t.project_id = p.project_id
                WHERE at.employee_id = ?
            ";
            $params = [$employee_id];

            if ($project_id) {
                $query .= " AND p.project_id = ?";
                $params[] = $project_id;
            }

            // Validate sort_by to prevent SQL injection
            $valid_sort_columns = ['due_date', 'project_name'];
            $sort_by = in_array($sort_by, $valid_sort_columns) ? $sort_by : 'due_date';
            $sort_order = strtoupper($sort_order) === 'DESC' ? 'DESC' : 'ASC';
            $query .= " ORDER BY $sort_by $sort_order";

            $tasks = fetchData($con, $query, $params, "Failed to fetch tasks");
            $response['tasks'] = $tasks;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'update_task_status') {
            $task_id = $_POST['task_id'] ?? null;
            $new_status = $_POST['new_status'] ?? null;

            if (!$task_id || !$new_status) {
                $response['error'] = "Task ID and new status are required.";
                echo json_encode($response);
                exit;
            }

            // Validate status
            $valid_statuses = ['not_started', 'in_progress', 'completed', 'blocked'];
            if (!in_array($new_status, $valid_statuses)) {
                $response['error'] = "Invalid status value.";
                echo json_encode($response);
                exit;
            }

            $stmt = $con->prepare("
                UPDATE Task t
                JOIN Assignment_Task at ON t.task_id = at.task_id
                SET t.status = ?
                WHERE t.task_id = ? AND at.employee_id = ?
            ");
            $success = $stmt->execute([$new_status, $task_id, $employee_id]);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Task status updated successfully.";
            } else {
                $response['error'] = "Failed to update task status.";
            }
        }  elseif ($_POST['action'] === 'fetch_performance_metrics') {
            // Total tasks assigned
            $total_tasks_query = "
                SELECT COUNT(*) AS total_tasks
                FROM Assignment_Task at
                WHERE at.employee_id = ?
            ";
            $total_tasks_result = fetchData($con, $total_tasks_query, [$employee_id], "Failed to fetch total tasks");
            $total_tasks = $total_tasks_result[0]['total_tasks'] ?? 0;

            // Completed tasks
            $completed_tasks_query = "
                SELECT COUNT(*) AS completed_tasks
                FROM Assignment_Task at
                JOIN Task t ON at.task_id = t.task_id
                WHERE at.employee_id = ? AND t.status = 'completed'
            ";
            $completed_tasks_result = fetchData($con, $completed_tasks_query, [$employee_id], "Failed to fetch completed tasks");
            $completed_tasks = $completed_tasks_result[0]['completed_tasks'] ?? 0;

            // On-time completion rate
            $on_time_tasks_query = "
                SELECT COUNT(*) AS on_time_tasks
                FROM Assignment_Task at
                JOIN Task t ON at.task_id = t.task_id
                WHERE at.employee_id = ? 
                AND t.status = 'completed'
                AND at.due_date >= (
                    SELECT MAX(a.action_date)
                    FROM Audit_Log a
                    WHERE a.user_id = (SELECT user_id FROM Employees WHERE employee_id = ?)
                    AND a.action LIKE 'Task % completed'
                )
            ";
            $on_time_tasks_result = fetchData($con, $on_time_tasks_query, [$employee_id, $employee_id], "Failed to fetch on-time tasks");
            $on_time_tasks = $on_time_tasks_result[0]['on_time_tasks'] ?? 0;

            $on_time_rate = $completed_tasks > 0 ? ($on_time_tasks / $completed_tasks) * 100 : 0;

            $response['metrics'] = [
                'total_tasks' => $total_tasks,
                'completed_tasks' => $completed_tasks,
                'on_time_rate' => round($on_time_rate, 2)
            ];
            $response['success'] = true;
        }
    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    }

    echo json_encode($response);
    exit;
}

// Fetch leave types for the apply leave form
$leave_types = fetchData($con, "SELECT leave_type_id, leave_name FROM Leave_Type WHERE status = 'active'", [], "Failed to fetch leave types");

// Fetch initial leave balance for display (optional, as we'll fetch via AJAX)
$leave_balances = fetchData($con, "
    SELECT 
        lb.leave_type_id, lt.leave_name, lb.total_days_allocated, lb.days_used,
        (lb.total_days_allocated - lb.days_used) AS remaining_days
    FROM Leave_Balance lb
    JOIN Leave_Type lt ON lb.leave_type_id = lt.leave_type_id
    WHERE lb.employee_id = ? AND lt.status = 'active'
", [$employee_id], "Failed to fetch leave balance");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        /* Alert styling to match manager dashboard */
        .alert-success {
            padding: 15px;
            color: #4CAF50;
            border-radius: 6px;
            transition: color 0.3s;
        }
        .alert-error {
            padding: 15px;
            color: #721c24;
            border-radius: 6px;
            transition: color 0.3s;
        }
        /* Projects and Tasks Section */
        #projects-table, #tasks-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        }
        #projects-table th, #projects-table td,
        #tasks-table th, #tasks-table td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
        }
        #projects-table th, #tasks-table th {
        background-color: #003087;
        color: #fff;
        }
        #projects-table tr:nth-child(even),
        #tasks-table tr:nth-child(even) {
        background-color: #f9f9f9;
        }
        #projects-table tr:hover,
        #tasks-table tr:hover {
        background-color: #f1f1f1;
        }
        #tasks-table select {
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #ddd;
        cursor: pointer;
        }
        #performance-metrics p {
        margin: 10px 0;
        font-size: 16px;
        }
        #performance-metrics span {
        font-weight: bold;
        color: #003087;
        }
        /* Styles for Attendance & Leaves features */
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #003087; color: #fff; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input, .form-group select { width: 100%; padding: 8px; box-sizing: border-box; }
        .button-group { text-align: right; }
        .button-group button {
            padding: 8px 15px; /* Match back-btn padding */
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 14px; /* Ensure consistent font size */
            transition: background-color 0.3s ease;
        }
        .button-group button:hover {
            background-color: #0056b3;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: bold;
            color: black;
            font-size: 12px;
        }
        .status-pending { background-color: #ff9800; }
        .status-approved { background-color: #4caf50; }
        .status-rejected { background-color: #f44336; }
        .back-btn {
            padding: 8px 15px;
            background-color: #003087;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px; /* Ensure consistent font size */
        }
        .back-btn:hover { background-color: #002766; }
        /* Leave balance table styling */
        #leave-balance-table th {
            background-color: #e9ecef;
            color: #333;
        }
        #leave-balance-table td {
            color: #6C757D;
        }
        #leave-balance-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        #leave-balance-table tr:hover {
            background-color: #f1f1f1;
        }
        /* FAQ Section Styling */
        .faq-item {
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .faq-item h4 {
            margin: 0 0 5px 0;
            color: #003087;
        }
        .faq-item p {
            margin: 0;
            color: #6C757D;
        }
        /* HR Contact Section Styling */
        .hr-contact-info {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .hr-contact-info p {
            margin: 5px 0;
            color: #6C757D;
        }
        .hr-contact-info p strong {
            color: #003087;
        }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_user.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?> (Employee)</h2>
            <p>You are in Employee Dashboard, select an option from the menu on the left to get started.</p>
        </div>

        <!-- Salary Details Section (This should be present) -->
  <div id="salary-details-section" style="display: none;" class="card">
    <!-- Content will be populated dynamically by fetchSalaryDetails -->
  </div>
<!-- Feedback Section -->
  <div id="feedback-section" style="display: none;" class="card">
    <!-- Content will be populated dynamically by fetchFeedback -->
  </div>

  <!-- Submit Exit Interview Section -->
  <div id="submit-exit-interview-section" style="display: none;" class="card">
    <!-- Content will be populated dynamically by showSubmitExitInterviewForm -->
  </div>

  <!-- View Exit Interview Section -->
  <div id="exit-interview-details-section" style="display: none;" class="card">
    <!-- Content will be populated dynamically by fetchExitInterviewDetails -->
  </div>
        <!-- Projects and Tasks Section -->
        <div id="projects-tasks-section" style="display: none;" class="card">
            <h2>Projects and Tasks</h2>
            
            <!-- Projects Overview -->
            <div id="projects-overview">
                <h3>Assigned Projects</h3>
                <table id="projects-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Start Date</th>
                            <th>Expected End Date</th>
                            <th>Status</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody id="projects-table-body"></tbody>
                </table>
            </div>

            <!-- Tasks List -->
            <div id="tasks-list" style="margin-top: 30px;">
                <h3>Assigned Tasks</h3>
                <div class="form-group">
                    <label for="task_sort_by">Sort By:</label>
                    <select id="task_sort_by" onchange="fetchTasks()">
                        <option value="due_date">Due Date</option>
                        <option value="project_name">Project</option>
                    </select>
                    <label for="task_sort_order">Order:</label>
                    <select id="task_sort_order" onchange="fetchTasks()">
                        <option value="ASC">Ascending</option>
                        <option value="DESC">Descending</option>
                    </select>
                    <label for="task_project_filter">Filter by Project:</label>
                    <select id="task_project_filter" onchange="fetchTasks()">
                        <option value="">All Projects</option>
                        <!-- Populated dynamically -->
                    </select>
                </div>
                <table id="tasks-table">
                    <thead>
                        <tr>
                            <th>Task Description</th>
                            <th>Project</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="tasks-table-body"></tbody>
                </table>
            </div>

            <!-- Performance Metrics -->
            <div id="performance-metrics" style="margin-top: 30px;">
                <h3>Performance Metrics</h3>
                <div id="metrics-display">
                    <p><strong>Total Tasks Assigned:</strong> <span id="total-tasks">0</span></p>
                    <p><strong>Tasks Completed:</strong> <span id="completed-tasks">0</span></p>
                    <p><strong>On-Time Completion Rate:</strong> <span id="on-time-rate">0%</span></p>
                </div>
            </div>

            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>

        <!-- Mark Attendance Section -->
        <div id="mark-attendance-section" style="display: none;" class="card">
            <h2>Mark Daily Attendance</h2>
            <form id="mark-attendance-form">
                <div class="form-group">
                    <label for="check_in">Check-In Time:</label>
                    <input type="datetime-local" id="check_in" name="check_in" required>
                </div>
                <div class="form-group">
                    <label for="check_out">Check-Out Time (Optional):</label>
                    <input type="datetime-local" id="check_out" name="check_out">
                </div>
                <div class="form-group">
                    <label for="status">Status:</label>
                    <select id="status" name="status">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Mark Attendance</button>
                    <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
        </div>

        <!-- Attendance History Section -->
        <div id="attendance-history-section" style="display: none;" class="card">
            <h2>Attendance History</h2>
            <div class="form-group">
                <label for="attendance_start_date">Start Date:</label>
                <input type="date" id="attendance_start_date" name="start_date">
            </div>
            <div class="form-group">
                <label for="attendance_end_date">End Date:</label>
                <input type="date" id="attendance_end_date" name="end_date">
            </div>
            <div class="form-group button-group">
                <button type="button" onclick="fetchAttendanceHistory()">Filter</button>
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="attendance-history-table"></tbody>
            </table>
        </div>

        <!-- Apply for Leave Section -->
        <div id="apply-leave-section" style="display: none;" class="card">
            <h2>Apply for Leave</h2>
            <form id="apply-leave-form">
                <div class="form-group">
                    <label for="leave_type_id">Leave Type:</label>
                    <select id="leave_type_id" name="leave_type_id" required>
                        <option value="">Select a leave type</option>
                        <?php foreach ($leave_types as $leave_type): ?>
                            <?php
                            // Find the corresponding balance for this leave type
                            $remaining_days = 0;
                            foreach ($leave_balances as $balance) {
                                if ($balance['leave_type_id'] == $leave_type['leave_type_id']) {
                                    $remaining_days = $balance['remaining_days'];
                                    break;
                                }
                            }
                            ?>
                            <option value="<?php echo htmlspecialchars($leave_type['leave_type_id']); ?>">
                                <?php echo htmlspecialchars($leave_type['leave_name']) . " (Remaining: $remaining_days days)"; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="leave_start_date">Start Date:</label>
                    <input type="date" id="leave_start_date" name="start_date" required>
                </div>
                <div class="form-group">
                    <label for="leave_end_date">End Date:</label>
                    <input type="date" id="leave_end_date" name="end_date" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Apply</button>
                    <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
            <div>
                <h3>Leave Balance Summary</h3>
                <table id="leave-balance-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Total Days Allocated</th>
                            <th>Days Used</th>
                            <th>Remaining Days</th>
                        </tr>
                    </thead>
                    <tbody id="leave-balance-table-body">
                        <?php foreach ($leave_balances as $balance): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($balance['leave_name']); ?></td>
                                <td><?php echo htmlspecialchars($balance['total_days_allocated']); ?></td>
                                <td><?php echo htmlspecialchars($balance['days_used']); ?></td>
                                <td><?php echo htmlspecialchars($balance['remaining_days']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Track Leave Requests Section -->
        <div id="track-leave-section" style="display: none;" class="card">
            <h2>Track Leave Requests</h2>
            <div class="form-group">
                <label for="leave_filter">Filter by Status:</label>
                <select id="leave_filter" name="leave_filter" onchange="fetchLeaveRequests()">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="leave-requests-table"></tbody>
            </table>
        </div>

        <!-- FAQs Section -->
        <div id="faqs-section" style="display: none;" class="card">
            <h2>Frequently Asked Questions (FAQs)</h2>
            <div class="faq-item">
                <h4>1. How do I apply for a leave?</h4>
                <p>Go to the "Attendance & Leaves" section in the sidebar, select "Apply for Leave," choose your leave type, specify the dates, and click "Apply."</p>
            </div>
            <div class="faq-item">
                <h4>2. How can I check my leave balance?</h4>
                <p>In the "Apply for Leave" section, your remaining leave balance is displayed next to each leave type and in the Leave Balance Summary table below the form.</p>
            </div>
            <div class="faq-item">
                <h4>3. What should I do if I forget my password?</h4>
                <p>Go to "Profile Management" in the sidebar, select "Change Password," and follow the instructions to reset your password.</p>
            </div>
            <div class="faq-item">
                <h4>4. How do I mark my daily attendance?</h4>
                <p>Navigate to "Attendance & Leaves" in the sidebar, select "Mark Daily Attendance," enter your check-in and check-out times, and submit the form.</p>
            </div>
            <div class="faq-item">
                <h4>5. Who do I contact for payroll issues?</h4>
                <p>Please reach out to our HR representative. You can find their contact details in the "HR Contact" section under "Help & Support."</p>
            </div>
            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>

        <!-- HR Contact Section -->
        <div id="hr-contact-section" style="display: none;" class="card">
            <h2>HR Contact Information</h2>
            <div class="hr-contact-info">
                <p><strong>Name:</strong> Jane Smith</p>
                <p><strong>Email:</strong> <a href="mailto:jane.smith@gmail.com">jane.smith@gmail.com</a></p>
            </div>
            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>

        <div id="profile-update-form" style="display: none;"></div>

        <?php if (isset($_SESSION['success'])): ?>
            <div class="alert-success"><?php echo htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['error'])): ?>
            <div class="alert-error"><?php echo htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
        <?php endif; ?>
    </div>
</div>

<script>     
const userName = <?php echo json_encode(htmlspecialchars($_SESSION['user_name'])); ?>;
document.addEventListener('click', function(event) {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (!alert.contains(event.target)) {
                alert.style.display = 'none';
            }
        });
    });



</script>

<script src="../assets/js/dashboard.js"></script>
<script src="../assets/js/user_dashboard.js"></script>
</body>
</html>