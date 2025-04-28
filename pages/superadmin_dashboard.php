<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Super Admin Dashboard";

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

    if ($_POST['action'] === 'refresh_data') {
        $sections = isset($_POST['section']) && $_POST['section'] === 'reports'
            ? ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'employee_trainings', 'projects', 'task_assignments', 'training_overview']
            : ['all'];
        $data = fetchData($con, $sections);
        $response['success'] = true;
        $response = array_merge($response, $data);
        echo json_encode($response);
        exit();
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
    const projects = <?php echo json_encode($projects); ?>;
    const taskAssignments = <?php echo json_encode($task_assignments); ?>;
    const trainingOverview = <?php echo json_encode($training_overview); ?>;
</script>
<script src="../assets/js/superadmin_dashboard.js"></script>
<script src="../assets/js/dashboard.js"></script>
</body>
</html>