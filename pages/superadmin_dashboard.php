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

    return $data;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $sections = isset($_POST['section']) && $_POST['section'] === 'reports'
            ? ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'employee_trainings']
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
$data = fetchData($con, ['employees', 'feedback', 'report_avg_ratings', 'report_feedback_types', 'project_assignments', 'employee_trainings']);
$employees = $data['employees'] ?? [];
$feedback = $data['feedback'] ?? [];
$report_avg_ratings = $data['report_avg_ratings'] ?? [];
$report_feedback_types = $data['report_feedback_types'] ?? [];
$project_assignments = $data['project_assignments'] ?? [];
$employee_trainings = $data['employee_trainings'] ?? [];
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
                <div class="report-section">
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
                <div class="report-section">
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
                <div class="report-section">
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
                <div class="report-section">
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
                <div class="report-section">
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
    </div>
</div>
<script>
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
    const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
    const projectAssignments = <?php echo json_encode($project_assignments); ?>;
    const employeeTrainings = <?php echo json_encode($employee_trainings); ?>;
</script>
<script src="../assets/js/superadmin_dashboard.js"></script>
<script src="../assets/js/dashboard.js"></script>
</body>
</html>