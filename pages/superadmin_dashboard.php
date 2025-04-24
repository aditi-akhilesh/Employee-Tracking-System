<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Super Admin Dashboard";

// Fetch departments with description and employee count
try {
    $stmt = $con->query("
        SELECT distinct
            d.department_id, 
            d.department_name, 
            d.department_description, 
            COUNT(e.employee_id) AS employee_count
        FROM Department d
        LEFT JOIN Employees e ON d.department_id = e.department_id 
        GROUP BY d.department_id, d.department_name, d.department_description
    ");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
    $_SESSION['error'] = "Failed to fetch department information: " . $e->getMessage();
}


// Function to fetch data for reports
function fetchData($con, $sections = ['all']) {
    $data = [];

    // Helper function to check if a section should be fetched
    $shouldFetch = function($section) use ($sections) {
        return in_array('all', $sections) || in_array($section, $sections);
    };

    // Fetch all active employees
    if ($shouldFetch('employees')) {
        $stmt = $con->prepare("
            SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
            FROM Employees e 
            JOIN Users u ON e.user_id = u.user_id 
            WHERE e.emp_status != 'inactive' AND u.is_active = 1
        ");
        $stmt->execute();
        $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Feedback given across all employees
    if ($shouldFetch('feedback')) {
        $stmt = $con->prepare("
            SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
                   u.first_name, u.last_name 
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            JOIN Users u ON e.user_id = u.user_id
        ");
        $stmt->execute();
        $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Report data: Average rating per employee
    if ($shouldFetch('report_avg_ratings')) {
        $stmt = $con->prepare("
            SELECT e.employee_id, u.first_name, u.last_name, AVG(f.rating) as avg_rating, COUNT(f.feedback_id) as feedback_count
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            JOIN Users u ON e.user_id = u.user_id 
            GROUP BY e.employee_id, u.first_name, u.last_name
        ");
        $stmt->execute();
        $data['report_avg_ratings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Report data: Feedback type distribution
    if ($shouldFetch('report_feedback_types')) {
        $stmt = $con->prepare("
            SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            GROUP BY f.feedback_type
        ");
        $stmt->execute();
        $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch project assignments
    if ($shouldFetch('project_assignments')) {
        $stmt = $con->prepare("
            SELECT a.assignment_id, a.project_id, a.employee_id, a.role_in_project, 
                   p.project_name, u.first_name, u.last_name
            FROM Assignment a
            JOIN Projects p ON a.project_id = p.project_id
            JOIN Employees e ON a.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE p.project_status != 'Completed'
        ");
        $stmt->execute();
        $data['project_assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch training certificates for all employees
    if ($shouldFetch('employee_trainings')) {
        $stmt = $con->prepare("
            SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
                   et.completion_status, et.score, t.training_name, t.certificate, t.training_date
            FROM Employee_Training et
            JOIN Employees e ON et.employee_id = e.employee_id
            JOIN Training t ON et.training_id = t.training_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE et.completion_status = 'completed'
        ");
        $stmt->execute();
        $data['employee_trainings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch project overview
    if ($shouldFetch('projects')) {
        $stmt = $con->prepare("
            SELECT p.project_id, p.project_name, p.project_status, p.budget, p.actual_cost, 
                   p.start_date, p.expected_end_date, d.department_name
            FROM Projects p
            JOIN Department d ON p.department_id = d.department_id
        ");
        $stmt->execute();
        $data['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch task assignments
    if ($shouldFetch('task_assignments')) {
        $stmt = $con->prepare("
            SELECT at.assignment_task_id, at.task_id, at.employee_id, at.due_date, 
                   t.task_description, t.status, p.project_name, u.first_name, u.last_name
            FROM Assignment_Task at
            JOIN Task t ON at.task_id = t.task_id
            JOIN Projects p ON t.project_id = p.project_id
            JOIN Employees e ON at.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
        ");
        $stmt->execute();
        $data['task_assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch training overview
    if ($shouldFetch('training_overview')) {
        $stmt = $con->prepare("
            SELECT t.training_id, t.training_name, t.training_date, t.end_date, t.certificate,
                   COUNT(et.employee_id) as enrolled_count, 
                   AVG(et.score) as avg_score
            FROM Training t
            LEFT JOIN Employee_Training et ON t.training_id = et.training_id
            GROUP BY t.training_id, t.training_name, t.training_date, t.end_date, t.certificate
        ");
        $stmt->execute();
        $data['training_overview'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

// Fetch subtask counts per employee
    if ($shouldFetch('subtask_counts')) {
        $stmt = $con->prepare("
            SELECT at.employee_id, u.first_name, u.last_name, COUNT(at.task_id) as subtask_count
            FROM Assignment_Task at
            JOIN Employees e ON at.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
            GROUP BY at.employee_id, u.first_name, u.last_name
        ");
        $stmt->execute();
        $data['subtask_counts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    return $data;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    try {
        if ($_POST['action'] === 'refresh_data') {
            $sections = isset($_POST['section']) && $_POST['section'] === 'reports'
                ? ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'employee_trainings', 'projects', 'task_assignments', 'training_overview', 'subtask_counts']
                : ['all'];
            $data = fetchData($con, $sections);
            $response['success'] = true;
            $response = array_merge($response, $data);
            echo json_encode($response);
            exit();
        } elseif ($_POST['action'] === 'fetch_leave_applications') {
            $leave_filter = $_POST['leave_filter'] ?? 'ispending';
            $logged_in_employee_id = $_SESSION['employee_id'] ?? null;
    
            $query = "
                SELECT 
                    l.leave_id AS request_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    l.leave_start_date, 
                    l.leave_end_date, 
                    l.status,
                    l.leave_reason
                FROM Leaves l
                JOIN Employees e ON l.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                WHERE l.status = ?
            ";
            $params = [$leave_filter];
    
            if ($logged_in_employee_id) {
                $query .= " AND e.employee_id != ?";
                $params[] = $logged_in_employee_id;
            }
    
            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['leave_applications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_attendance') {
            $employee_id = $_POST['employee_id'] ?? '';
            $start_date = $_POST['start_date'] ?? '';
            $end_date = $_POST['end_date'] ?? '';
            $logged_in_employee_id = $_SESSION['employee_id'] ?? null;
    
            $query = "
                SELECT 
                    a.employee_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    d.department_name, 
                    a.check_in, 
                    a.check_out,
                    CASE 
                        WHEN a.status = 'present' THEN 'Present'
                        WHEN a.status = 'absent' THEN 'Absent'
                        ELSE a.status
                    END AS status
                FROM Attendance a
                JOIN Employees e ON a.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                JOIN Department d ON e.department_id = d.department_id
                WHERE 1=1
            ";
            $params = [];
    
            if ($logged_in_employee_id) {
                $query .= " AND a.employee_id != ?";
                $params[] = $logged_in_employee_id;
            }
    
            if ($employee_id) {
                $query .= " AND a.employee_id = ?";
                $params[] = $employee_id;
            }
            if ($start_date) {
                $query .= " AND DATE(a.check_in) >= ?";
                $params[] = $start_date;
            }
            if ($end_date) {
                $query .= " AND DATE(a.check_out) <= ?";
                $params[] = $end_date;
            }
    
            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['attendance_records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'reconsider_leave') {
            $request_id = $_POST['request_id'];
            $stmt = $con->prepare("UPDATE Leaves SET status = 'ispending' WHERE leave_id = ?");
            $stmt->execute([$request_id]);
            $response['success'] = true;
            $response['message'] = "Leave application moved back to pending.";
        } elseif ($_POST['action'] === 'update_leave_status') {
            $request_id = $_POST['request_id'];
            $new_status = $_POST['status'];
            $stmt = $con->prepare("UPDATE Leaves SET status = ?, approved_by = ? WHERE leave_id = ?");
            $stmt->execute([$new_status, $_SESSION['user_id'], $request_id]);
            $response['success'] = true;
            $response['message'] = "Leave application status updated to " . $new_status . ".";
        } elseif ($_POST['action'] === 'fetch_department_metrics') {
            $stmt = $con->prepare("SELECT department_id, department_name FROM Department");
            $stmt->execute();
            $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            $metrics = [];
            foreach ($departments as $dept) {
                $dept_id = $dept['department_id'];
                $metric = [
                    'department_name' => $dept['department_name'],
                    'employee_count' => 0,
                    'projects_completed' => 0,
                    'projects_in_progress' => 0,
                    'projects_assigned' => 0,
                    'tasks_completed' => 0,
                    'trainings_conducted' => 0,
                    'avg_feedback_rating' => 0,
                    'total_leaves_taken' => 0
                ];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Employees e
                    JOIN Users u ON e.user_id = u.user_id
                    WHERE e.department_id = ? AND e.emp_status != 'inactive' AND u.is_active = 1
                ");
                $stmt->execute([$dept_id]);
                $metric['employee_count'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'Completed'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_completed'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'In Progress'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_in_progress'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Projects 
                    WHERE department_id = ? AND project_status = 'Assigned'
                ");
                $stmt->execute([$dept_id]);
                $metric['projects_assigned'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Task t
                    JOIN Projects p ON t.project_id = p.project_id
                    WHERE p.department_id = ? AND t.status = 'Completed'
                ");
                $stmt->execute([$dept_id]);
                $metric['tasks_completed'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Training 
                    WHERE department_id = ?
                ");
                $stmt->execute([$dept_id]);
                $metric['trainings_conducted'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $stmt = $con->prepare("
                    SELECT AVG(f.rating) as avg_rating 
                    FROM Feedback f
                    JOIN Employees e ON f.employee_id = e.employee_id
                    WHERE e.department_id = ?
                ");
                $stmt->execute([$dept_id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $metric['avg_feedback_rating'] = $result['avg_rating'] ? round($result['avg_rating'], 2) : 0;
    
                $stmt = $con->prepare("
                    SELECT COUNT(*) as count 
                    FROM Leaves l
                    JOIN Employees e ON l.employee_id = e.employee_id
                    WHERE e.department_id = ? AND l.status = 'approved'
                ");
                $stmt->execute([$dept_id]);
                $metric['total_leaves_taken'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
                $metrics[] = $metric;
            }
    
            $response['department_metrics'] = $metrics;
            $response['success'] = true;
        }
    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    }

    echo json_encode($response);
    exit();
}

// Initial data fetch for reports
$data = fetchData($con, ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'employee_trainings', 'projects', 'task_assignments', 'training_overview', 'subtask_counts']);
$employees = $data['employees'] ?? [];
$feedback = $data['feedback'] ?? [];
$report_avg_ratings = $data['report_avg_ratings'] ?? [];
$report_feedback_types = $data['report_feedback_types'] ?? [];
$project_assignments = $data['project_assignments'] ?? [];
$employee_trainings = $data['employee_trainings'] ?? [];
$projects = $data['projects'] ?? [];
$task_assignments = $data['task_assignments'] ?? [];
$training_overview = $data['training_overview'] ?? [];
$subtask_counts = $data['subtask_counts'] ?? [];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        .alert { padding: 10px; margin: 10px 0; border-radius: 5px; cursor: pointer; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th  th { background-color: #003087; color: #fff; }
        .content { padding: 20px; }
        .dropdown { display: none; opacity: 0; transition: opacity 0.2s; }
        .dropdown.show { display: block; opacity: 1; }
        .reconsider-btn {
            padding: 5px 10px;
            background-color: #ff9800;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .reconsider-btn:hover { background-color: #e68900; }
        .action-form { display: inline; }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: bold;
            color: white;
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
        }
        .back-btn:hover { background-color: #002766; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input, .form-group select { width: 100%; padding: 8px; box-sizing: border-box; }
        .button-group { text-align: right; }
        .button-group button { padding: 10px 20px; margin-left: 10px; }
        th i.fas {
            margin-left: 5px;
            vertical-align: middle;
            font-size: 0.9em;
            color: #999999;
        }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_superadmin.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Super Admin'); ?> (Super Admin)</h2>
            <p>You are in the Super Admin dashboard. Select an option from the menu on the left to get started.</p>
        </div>
        <div id="create-user-form" style="display: none;"></div>
        <div id="reports-analytics" style="display: none;" class="card">
            <h2>Reports and Analytics</h2>
            <div class="report-filter">
                <div class="form-group">
                    <label for="employee-search">Search Employee:</label>
                    <select id="employee-search">
                        <option value="">Select an employee</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="button" id="generate-report-btn">Generate Report</button>
                </div>
            </div>
            <div class="report-section" id="report-content" style="display: none;">
                <div id="avg-ratings-section" class="report-section" style="display: none;">
                    <h3>Average Ratings per Employee</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Average Rating</th>
                                <th>Feedback Count</th>
                            </tr>
                        </thead>
                        <tbody id="avg-ratings-table"></tbody>
                    </table>
                </div>
                <div id="feedback-types-section" class="report-section" style="display: none;">
                    <h3>Feedback Type Distribution</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Feedback Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-types-table"></tbody>
                    </table>
                </div>
                <div id="work-summary-section" class="report-section" style="display: none;">
                    <h3>Work Summary</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="work-summary-table"></tbody>
                    </table>
                </div>
                <div id="training-certificates-section" class="report-section" style="display: none;">
                    <h3>Training Certificates</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Training Name</th>
                                <th>Training Date</th>
                                <th>Certificate</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody id="training-certificates-table"></tbody>
                    </table>
                </div>
                <div id="feedback-summary-section" class="report-section" style="display: none;">
                    <h3>Feedback Summary</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Rating</th>
                                <th>Feedback Type</th>
                                <th>Feedback Details</th>
                                <th>Date Submitted</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-summary-table"></tbody>
                    </table>
                </div>
                <div class="form-group button-group">
                    <button type="button" id="download-pdf-btn">Download PDF</button>
                </div>
            </div>
        </div>
        <div id="attendance-records" style="display: none;" class="card">
            <h2>Attendance Records</h2>
            <div class="form-group">
                <label for="attendance-employee-search">Search Employee:</label>
                <select id="attendance-employee-search">
                    <option value="">All Employees</option>
                    <?php foreach ($employees as $emp): ?>
                        <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                            <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="start-date">Start Date:</label>
                <input type="date" id="start-date">
            </div>
            <div class="form-group">
                <label for="end-date">End Date:</label>
                <input type="date" id="end-date">
            </div>
            <div class="form-group button-group">
                <button type="button" id="fetch-attendance-btn">Fetch Attendance</button>
            </div>
            <table id="attendance-table">
                <thead>
                    <tr>
                        <th>Employee Name <i class="fas fa-sort"></i></th>
                        <th>Department <i class="fas fa-sort"></i></th>
                        <th>Check In <i class="fas fa-sort"></i></th>
                        <th>Check Out <i class="fas fa-sort"></i></th>
                        <th>Status <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody id="attendance-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
        </div>
        <div id="leave-requests" style="display: none;" class="card">
            <h2>Leave Requests</h2>
            <div class="form-group">
                <label for="leave-filter">Filter by Status:</label>
                <select id="leave-filter">
                    <option value="ispending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div class="form-group button-group">
                <button type="button" id="fetch-leave-btn">Fetch Leave Requests</button>
            </div>
            <table id="leave-table">
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="leave-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
        </div>
        <div id="department-metrics" style="display: none;" class="card">
            <h2>Department-wise Performance Metrics</h2>
            <table id="department-metrics-table">
                <thead>
                    <tr>
                        <th>Department Name <i class="fas fa-sort"></i></th>
                        <th>Employee Count <i class="fas fa-sort"></i></th>
                        <th>Projects Completed <i class="fas fa-sort"></i></th>
                        <th>Projects In Progress <i class="fas fa-sort"></i></th>
                        <th>Projects Assigned <i class="fas fa-sort"></i></th>
                        <th>Tasks Completed <i class="fas fa-sort"></i></th>
                        <th>Trainings Conducted <i class="fas fa-sort"></i></th>
                        <th>Avg Feedback Rating <i class="fas fa-sort"></i></th>
                        <th>Total Leaves Taken <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody id="department-metrics-table-body"></tbody>
            </table>
            <button class="back-btn" onclick="showWelcomeMessage()">Back</button>
        </div>
        <?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        }
        if (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }
        ?>
        <!-- New container for tab-specific content -->
        <div id="project-task-content" style="display: none;" class="card">
            <div id="project-overview-section" class="report-section" style="display: none;">
                <h3>Project Overview</h3>
                <div class="report-filter">
                    <div class="form-group">
                        <label for="project-status-filter">Filter by Status:</label>
                        <select id="project-status-filter">
                            <option value="">All</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div id="project-overview-summary" class="report-summary">
                    <p>Total Projects: <span id="total-projects">0</span></p>
                    <p>Overdue Projects: <span id="overdue-projects">0</span></p>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>Expected End Date</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody id="project-overview-table"></tbody>
                </table>
            </div>
            <div id="project-budget-section" class="report-section" style="display: none;">
                <h3>Project Budget Monitor</h3>
                <div class="report-filter">
                    <div class="form-group">
                        <label for="budget-status-filter">Filter by Status:</label>
                        <select id="budget-status-filter">
                            <option value="">All</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div id="project-budget-summary" class="report-summary">
                    <p>Total Projects: <span id="total-budget-projects">0</span></p>
                    <p>Over Budget Projects: <span id="over-budget-projects">0</span></p>
                    <p>High Risk Projects: <span id="high-risk-projects">0</span></p>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Status</th>
                            <th>Budget</th>
                            <th>Actual Cost</th>
                            <th>Cost Difference</th>
                            <th>Expected End Date</th>
                        </tr>
                    </thead>
                    <tbody id="project-budget-table"></tbody>
                </table>
            </div>
            <div id="task-assignments-section" class="report-section" style="display: none;">
                <h3>Task Assignments</h3>
                <div class="highlight-legend">
                    <p><span class="highlight overdue"></span> Overdue Task (Due Date Passed, Not Done)</p>
                    <p><span class="highlight heavy-workload"></span> Heavy Workload (>5 Subtasks)</p>
                </div>
                <div id="workload-summary" class="report-summary">
                    <h4>Workload Distribution</h4>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Subtask Count</th>
                            </tr>
                        </thead>
                        <tbody id="workload-table"></tbody>
                    </table>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Assigned To</th>
                            <th>Tasks</th>
                            <th>Subtask Count</th>
                        </tr>
                    </thead>
                    <tbody id="task-assignments-table"></tbody>
                </table>
            </div>
            <div id="training-overview-section" class="report-section" style="display: none;">
                <h3>Training Overview</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Training Name</th>
                            <th>Training Date</th>
                            <th>End Date</th>
                            <th>Certificate</th>
                            <th>Enrolled Count</th>
                            <th>Average Score</th>
                        </tr>
                    </thead>
                    <tbody id="training-overview-table"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<script>
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
    const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
    const projectAssignments = <?php echo json_encode($project_assignments); ?>;
    const employeeTrainings = <?php echo json_encode($employee_trainings); ?>;
    const departments = <?php echo json_encode($departments ?: []); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    const taskAssignments = <?php echo json_encode($task_assignments); ?>;
    const trainingOverview = <?php echo json_encode($training_overview); ?>;
</script>
<script src="../assets/js/superadmin_dashboard.js"></script>
</body>
</html>