<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Manager Dashboard";

$manager_id = $_SESSION['employee_id'];
function fetchData($con, $manager_id) {
    $data = [];

    // Employees assigned to this manager
    $stmt = $con->prepare("
        SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
        FROM Employees e 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE e.manager_id = :manager_id AND e.emp_status != 'inactive' AND u.is_active = 1
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Employees for manager_id $manager_id: " . print_r($data['employees'], true));

    // Feedback given by this manager
    $stmt = $con->prepare("
        SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
               u.first_name, u.last_name 
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Average rating per employee
    $stmt = $con->prepare("
        SELECT e.employee_id, u.first_name, u.last_name, AVG(f.rating) as avg_rating, COUNT(f.feedback_id) as feedback_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY e.employee_id, u.first_name, u.last_name
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_avg_ratings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Feedback type distribution
    $stmt = $con->prepare("
        SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY f.feedback_type
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Projects where this manager is the reporting manager
    $stmt = $con->prepare("
        SELECT p.project_id, p.project_name, p.start_date, p.expected_end_date, p.actual_end_date, 
               p.client_name, p.client_contact_email, p.project_status, p.budget, p.actual_cost, p.department_id
        FROM Projects p
        JOIN Assignment a ON p.project_id = a.project_id
        WHERE a.reporting_manager_id = :manager_id AND p.project_status != 'Completed'
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tasks and their assignments for this manager's projects
    $stmt = $con->prepare("
        SELECT t.task_id, t.task_description, t.status, t.project_id, p.project_name,
               at.employee_id, at.due_date, u.first_name, u.last_name
        FROM Task t
        JOIN Projects p ON t.project_id = p.project_id
        JOIN Assignment a ON p.project_id = a.project_id
        LEFT JOIN Assignment_Task at ON t.task_id = at.task_id
        LEFT JOIN Employees e ON at.employee_id = e.employee_id
        LEFT JOIN Users u ON e.user_id = u.user_id
        WHERE a.reporting_manager_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['tasks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $data;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $data = fetchData($con, $manager_id);
        $response['success'] = true;
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

$data = fetchData($con, $manager_id);
$employees = $data['employees'];
$feedback = $data['feedback'];
$report_avg_ratings = $data['report_avg_ratings'];
$report_feedback_types = $data['report_feedback_types'];
$projects = $data['projects'];
$tasks = $data['tasks'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        .dashboard-container { display: flex; min-height: 100vh; background: #f4f7fa; }
        .content { flex: 1; padding: 30px; }
        .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 25px; margin-bottom: 30px; }
        h2 { color: #003087; font-size: 24px; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 500; color: #333; margin-bottom: 8px; }
        .form-group input, .form-group select { 
            width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; 
            font-size: 16px; transition: border-color 0.3s, box-shadow 0.3s; }
        .form-group input:focus, .form-group select:focus { 
            border-color: #003087; box-shadow: 0 0 5px rgba(0,48,135,0.3); outline: none; }
        .button-group { display: flex; gap: 15px; justify-content: flex-end; }
        .button-group button { 
            padding: 12px 25px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; 
            transition: background 0.3s, transform 0.2s; }
        .button-group button[type="submit"] { 
            background: linear-gradient(90deg, #003087, #0052cc); color: #fff; }
        .button-group button[type="submit"]:hover { background: linear-gradient(90deg, #00205b, #003087); transform: translateY(-2px); }
        .button-group button[type="button"] { background: #6c757d; color: #fff; }
        .button-group button[type="button"]:hover { background: #5a6268; transform: translateY(-2px); }
        .button-group button#delete-task-btn { background: linear-gradient(90deg, #dc3545, #c82333); }
        .button-group button#delete-task-btn:hover { background: linear-gradient(90deg, #c82333, #b21f2d); }
        .report-table { 
            width: 100%; border-collapse: separate; border-spacing: 0; background: #fff; 
            border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .report-table th { 
            background: #003087; color: #fff; padding: 15px; text-align: left; font-weight: 600; }
        .report-table td { padding: 15px; border-bottom: 1px solid #eee; }
        .report-table tr:nth-child(even) { background: #f9fbfc; }
        .report-table tr:hover { background: #e9ecef; cursor: pointer; transition: background 0.2s; }
        .alert { padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .alert-success { background: #d4edda; color: #155724; }
        .alert-error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_manager.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content" class="card">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?> (Manager)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="profile-update-form" style="display: none;"></div>
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
        <!-- Projects Section -->
        <div id="projects-section" style="display: none;" class="card">
            <h2>Project Status</h2>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Actual Cost</th>
                        <th>Start Date</th>
                        <th>Expected End</th>
                        <th>Actual End</th>
                        <th>Client</th>
                    </tr>
                </thead>
                <tbody id="projects-table"></tbody>
            </table>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)">Back</button>
            </div>
        </div>
        <!-- Assign Employees Section -->
        <div id="assign-employees-section" style="display: none;" class="card">
            <h2>Assign Employees to Project</h2>
            <form id="assign-employees-form" method="POST">
                <div class="form-group">
                    <label for="project_id_assign">Project:</label>
                    <select id="project_id_assign" name="project_id" required>
                        <option value="">Select a project</option>
                        <?php foreach ($projects as $project): ?>
                            <option value="<?php echo htmlspecialchars($project['project_id']); ?>">
                                <?php echo htmlspecialchars($project['project_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="employee_id_assign">Employee:</label>
                    <select id="employee_id_assign" name="employee_id" required>
                        <option value="">Select an employee</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="role_in_project">Role in Project:</label>
                    <input type="text" id="role_in_project" name="role_in_project" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Assign Employee</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        </div>
        <!-- Subtasks Section -->
        <div id="subtasks-section" style="display: none;" class="card">
            <h2>Create/Update Subtasks</h2>
            <form id="subtask-form" method="POST">
                <div class="form-group">
                    <label for="project_id_subtask">Project:</label>
                    <select id="project_id_subtask" name="project_id" required onchange="loadTasks()">
                        <option value="">Select a project</option>
                        <?php foreach ($projects as $project): ?>
                            <option value="<?php echo htmlspecialchars($project['project_id']); ?>">
                                <?php echo htmlspecialchars($project['project_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="task_id">Task (Optional):</label>
                    <select id="task_id" name="task_id">
                        <option value="">Create new task</option>
                        <!-- Populated dynamically by JS -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="task_description">Task Description:</label>
                    <input type="text" id="task_description" name="task_description" required>
                </div>
                <div class="form-group">
                    <label for="employee_id_subtask">Assignee:</label>
                    <select id="employee_id_subtask" name="employee_id">
                        <option value="">Unassigned</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="due_date">Due Date:</label>
                    <input type="date" id="due_date" name="due_date" required>
                </div>
                <div class="form-group">
                    <label for="task_status">Status:</label>
                    <select id="task_status" name="status" required>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit" id="save-task-btn">Save Task</button>
                    <button type="button" id="delete-task-btn" style="display: none;" onclick="deleteTask()">Delete Task</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
            <h3>Existing Subtasks</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Project</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="tasks-table"></tbody>
            </table>
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
    </div>
</div>
<script>
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
    const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    const tasks = <?php echo json_encode($tasks); ?>;
    const userName = "<?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?>";
    const managerId = <?php echo json_encode($manager_id); ?>;

    document.addEventListener('DOMContentLoaded', function() {
        refreshData();
    });
</script>
<script src="../assets/js/dashboard.js"></script>
<script src="../assets/js/manager_dashboard.js"></script>
</body>
</html>