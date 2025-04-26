<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Employee Dashboard";

// Fetch employee_id from session
$employee_id = $_SESSION['employee_id'];

$currentUser = intval($_SESSION['user_id']); 
$con->exec("SET @current_user_id := {$currentUser}");

// Fetch the employee's department_id
$stmt = $con->prepare("SELECT department_id FROM Employees WHERE employee_id = ?");
$stmt->execute([$employee_id]);
$employee = $stmt->fetch(PDO::FETCH_ASSOC);
$department_id = $employee['department_id'] ?? null;

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

// Handle AJAX requests for Attendance and other features
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
        } elseif ($_POST['action'] === 'fetch_performance_metrics') {
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
        } elseif ($_POST['action'] === 'fetch_departments') {
            error_log("fetch_departments action called");
            $departments = fetchData($con, "SELECT department_id, department_name FROM Department WHERE department_name != 'Head'", [], "Failed to fetch departments");
            error_log("Fetched departments: " . json_encode($departments));
            $response['departments'] = $departments;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_available_trainings') {
            error_log("fetch_available_trainings action called, department_id: " . ($_POST['department_id'] ?? 'none'));
            $department_id = $_POST['department_id'] ?? '';
            $query = "
                SELECT t.training_id, t.training_name, t.training_date, t.end_date, t.certificate, t.department_id
                FROM Training t
                WHERE t.training_id NOT IN (
                    SELECT et.training_id 
                    FROM Employee_Training et 
                    WHERE et.employee_id = ?
                )
                AND t.department_id NOT IN (SELECT department_id FROM Department WHERE department_name = 'Head')
            ";
            $params = [$employee_id];

            if ($department_id) {
                $query .= " AND t.department_id = ?";
                $params[] = $department_id;
            }

            $trainings = fetchData($con, $query, $params, "Failed to fetch available trainings");
            error_log("Fetched trainings: " . json_encode($trainings));
            $response['trainings'] = $trainings;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'enroll_training') {
            error_log("enroll_training action called, training_id: " . ($_POST['training_id'] ?? 'none'));
            $training_id = $_POST['training_id'] ?? null;
            if (!$training_id) {
                $response['error'] = "Training ID is required.";
                echo json_encode($response);
                exit;
            }

            // Check if the employee is already enrolled
            $stmt = $con->prepare("
                SELECT COUNT(*) 
                FROM Employee_Training 
                WHERE employee_id = ? AND training_id = ?
            ");
            $stmt->execute([$employee_id, $training_id]);
            $already_enrolled = $stmt->fetchColumn();

            if ($already_enrolled > 0) {
                $response['error'] = "You are already enrolled in this training program.";
                echo json_encode($response);
                exit;
            }

            // Check if the training belongs to the employee's department
            $stmt = $con->prepare("
                SELECT t.department_id 
                FROM Training t 
                WHERE t.training_id = ?
            ");
            $stmt->execute([$training_id]);
            $training = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $con->prepare("
                SELECT department_id 
                FROM Employees 
                WHERE employee_id = ?
            ");
            $stmt->execute([$employee_id]);
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($training['department_id'] != $employee['department_id']) {
                $response['error'] = "This training program is not available for your department.";
                echo json_encode($response);
                exit;
            }

            // Enroll the employee
            $stmt = $con->prepare("
                INSERT INTO Employee_Training (employee_id, training_id, enrollment_date, completion_status)
                VALUES (?, ?, CURDATE(), 'Not Started')
            ");
            $success = $stmt->execute([$employee_id, $training_id]);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Successfully enrolled in the training program.";
            } else {
                $response['error'] = "Failed to enroll in the training program.";
            }
        } elseif ($_POST['action'] === 'fetch_enrolled_trainings') {
            error_log("fetch_enrolled_trainings action called");
            $query = "
                SELECT 
                    et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date, 
                    et.completion_status, et.score, t.training_name
                FROM Employee_Training et
                JOIN Training t ON et.training_id = t.training_id
                WHERE et.employee_id = ?
            ";
            $enrolled_trainings = fetchData($con, $query, [$employee_id], "Failed to fetch enrolled trainings");
            $response['enrolled_trainings'] = $enrolled_trainings;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'update_training_status') {
            error_log("update_training_status action called, employee_training_id: " . ($_POST['employee_training_id'] ?? 'none'));
            $employee_training_id = $_POST['employee_training_id'] ?? null;
            $completion_status = $_POST['completion_status'] ?? null;

            if (!$employee_training_id || !$completion_status) {
                $response['error'] = "Employee training ID and completion status are required.";
                echo json_encode($response);
                exit;
            }

            $valid_statuses = ['Not Started', 'In Progress', 'Completed'];
            if (!in_array($completion_status, $valid_statuses)) {
                $response['error'] = "Invalid completion status.";
                echo json_encode($response);
                exit;
            }

            $stmt = $con->prepare("
                UPDATE Employee_Training 
                SET completion_status = ?
                WHERE employee_training_id = ? AND employee_id = ?
            ");
            $success = $stmt->execute([$completion_status, $employee_training_id, $employee_id]);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Training status updated successfully.";
            } else {
                $response['error'] = "Failed to update training status.";
            }
        } elseif ($_POST['action'] === 'update_training_score') {
            error_log("update_training_score action called, employee_training_id: " . ($_POST['employee_training_id'] ?? 'none'));
            $employee_training_id = $_POST['employee_training_id'] ?? null;
            $score = $_POST['score'] ?? null;

            if (!$employee_training_id || $score === null) {
                $response['error'] = "Employee training ID and score are required.";
                echo json_encode($response);
                exit;
            }

            if (!is_numeric($score) || $score < 0 || $score > 100) {
                $response['error'] = "Score must be a number between 0 and 100.";
                echo json_encode($response);
                exit;
            }

            $stmt = $con->prepare("
                UPDATE Employee_Training 
                SET score = ?
                WHERE employee_training_id = ? AND employee_id = ?
            ");
            $success = $stmt->execute([$score, $employee_training_id, $employee_id]);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Training score updated successfully.";
            } else {
                $response['error'] = "Failed to update training score.";
            }
        } elseif ($_POST['action'] === 'update_training') {
            error_log("update_training action called, employee_training_id: " . ($_POST['employee_training_id'] ?? 'none'));
            $employee_training_id = $_POST['employee_training_id'] ?? null;
            $completion_status = $_POST['completion_status'] ?? null;
            $score = $_POST['score'] ?? null;

            if (!$employee_training_id || !$completion_status) {
                $response['error'] = "Employee training ID and completion status are required.";
                echo json_encode($response);
                exit;
            }

            $valid_statuses = ['Not Started', 'In Progress', 'Completed'];
            if (!in_array($completion_status, $valid_statuses)) {
                $response['error'] = "Invalid completion status.";
                echo json_encode($response);
                exit;
            }

            if ($score !== null && (!is_numeric($score) || $score < 0 || $score > 100)) {
                $response['error'] = "Score must be a number between 0 and 100.";
                echo json_encode($response);
                exit;
            }

            $query = "
                UPDATE Employee_Training 
                SET completion_status = ?
                " . ($score !== null ? ", score = ?" : "") . "
                WHERE employee_training_id = ? AND employee_id = ?
            ";
            $params = [$completion_status];
            if ($score !== null) {
                $params[] = $score;
            }
            $params[] = $employee_training_id;
            $params[] = $employee_id;

            $stmt = $con->prepare($query);
            $success = $stmt->execute($params);

            if ($success) {
                $response['success'] = true;
                $response['message'] = "Training updated successfully.";
            } else {
                $response['error'] = "Failed to update training.";
            }
        }
    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    }

    echo json_encode($response);
    exit;
}
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

        <!-- Salary Details Section -->
        <div id="salary-details-section" style="display: none;" class="card"></div>

        <!-- Feedback Section -->
        <div id="feedback-section" style="display: none;" class="card"></div>
		 <!-- Enroll in Training Programs Section -->
        <div id="enroll-training-section" style="display: none;" class="card">
            <h2>Enroll in Training Programs</h2>
            <div class="form-group">
                <label for="training_filter">Filter by Department:</label>
                <select id="training_filter" onchange="fetchAvailableTrainings()">
                    <option value="">All Departments</option>
                    <!-- Populated dynamically -->
                </select>
            </div>
			<table id="available-trainings-table">
                <thead>
                    <tr>
                        <th>Training Name</th>
                        <th>Training Date</th>
                        <th>End Date</th>
                        <th>Certificate</th>
                        <th>Department ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="available-trainings-table-body"></tbody>
            </table>
            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>


        <!-- Submit Exit Interview Section -->
        <div id="submit-exit-interview-section" style="display: none;" class="card"></div>

        <!-- View Exit Interview Section -->
        <div id="exit-interview-details-section" style="display: none;" class="card"></div>

        <!-- Update Address Section -->
        <div id="update-address-section" style="display: none;" class="card"></div>

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

        <!-- Update Training Status Section -->
        <div id="update-training-status-section" style="display: none;" class="card">
            <h2>Update Training Status</h2>
            <table id="enrolled-trainings-table">
                <thead>
                    <tr>
                        <th>Training Name</th>
                        <th>Enrollment Date</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="enrolled-trainings-table-body"></tbody>
            </table>
            <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
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
const employeeDepartmentId = <?php echo json_encode($department_id); ?>;
const employeeId = <?php echo json_encode($employee_id); ?>;
console.log('userName:', userName);
console.log('employeeDepartmentId:', employeeDepartmentId);
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