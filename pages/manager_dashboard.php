<?php
require_once '../includes/auth_check.php';
require_once '../auth/dbconnect.php';

$page_title = "Manager Dashboard";

$manager_id = $_SESSION['employee_id'];

function fetchData($con, $manager_id, $sections = ['all']) {
    $data = [];

    // Helper function to check if a section should be fetched
    $shouldFetch = function($section) use ($sections) {
        return in_array('all', $sections) || in_array($section, $sections);
    };
    // Employees assigned to this manager
    if ($shouldFetch('employees')) {
        $stmt = $con->prepare("
            SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
            FROM Employees e 
            JOIN Users u ON e.user_id = u.user_id 
            WHERE e.manager_id = :manager_id AND e.emp_status != 'inactive' AND u.is_active = 1
        ");
        $stmt->execute(['manager_id' => $manager_id]);
        $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Employees for manager_id $manager_id: " . print_r($data['employees'], true) . "\n");
    }

    // Feedback given by this manager
    if ($shouldFetch('feedback')) {
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
    }

    // Report data: Average rating per employee
    if ($shouldFetch('report_avg_ratings')) {
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
    }

    // Report data: Feedback type distribution
    if ($shouldFetch('report_feedback_types')) {
        $stmt = $con->prepare("
            SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
            FROM Feedback f 
            JOIN Employees e ON f.employee_id = e.employee_id 
            WHERE f.reviewer_id = :manager_id
            GROUP BY f.feedback_type
        ");
        $stmt->execute(['manager_id' => $manager_id]);
        $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get manager's department_id
    $stmt = $con->prepare("
        SELECT department_id 
        FROM Employees 
        WHERE employee_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $manager_dept = $stmt->fetch(PDO::FETCH_ASSOC);
    $department_id = $manager_dept['department_id'];

    // Projects under the manager's department
    if ($shouldFetch('projects')) {
        $stmt = $con->prepare("
            SELECT p.project_id, p.project_name, p.start_date, p.expected_end_date, p.actual_end_date, 
                   p.client_name, p.client_contact_email, p.project_status, p.budget, p.actual_cost, p.department_id
            FROM Projects p
            WHERE p.department_id = :department_id AND p.project_status != 'Completed'
        ");
        $stmt->execute(['department_id' => $department_id]);
        $data['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Tasks and their assignments for projects in the manager's department
    if ($shouldFetch('tasks')) {
        $stmt = $con->prepare("
            SELECT t.task_id, t.task_description, t.status, t.project_id, p.project_name,
                   at.employee_id, at.due_date, u.first_name, u.last_name
            FROM Task t
            JOIN Projects p ON t.project_id = p.project_id
            LEFT JOIN Assignment_Task at ON t.task_id = at.task_id
            LEFT JOIN Employees e ON at.employee_id = e.employee_id
            LEFT JOIN Users u ON e.user_id = u.user_id
            WHERE p.department_id = :department_id
        ");
        $stmt->execute(['department_id' => $department_id]);
        $data['tasks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch employees assigned to projects in the manager's department
    if ($shouldFetch('project_assignments')) {
        $stmt = $con->prepare("
            SELECT a.assignment_id, a.project_id, a.employee_id, a.role_in_project, 
                p.project_name, u.first_name, u.last_name
            FROM Assignment a
            JOIN Projects p ON a.project_id = p.project_id
            JOIN Employees e ON a.employee_id = e.employee_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE p.department_id = :department_id AND p.project_status != 'Completed'
        ");
        $stmt->execute(['department_id' => $department_id]);
        $data['project_assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch training certificates for employees under this manager
    if ($shouldFetch('employee_trainings')) {
        $stmt = $con->prepare("
            SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
                   et.completion_status, et.score, t.training_name, t.certificate, t.training_date
            FROM Employee_Training et
            JOIN Employees e ON et.employee_id = e.employee_id
            JOIN Training t ON et.training_id = t.training_id
            JOIN Users u ON e.user_id = u.user_id
            WHERE e.manager_id = :manager_id AND et.completion_status = 'completed'
        ");
        $stmt->execute(['manager_id' => $manager_id]);
        $data['employee_trainings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    return $data;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $sections = isset($_POST['section']) && $_POST['section'] === 'project_assignments'
            ? ['projects', 'project_assignments']
            : (isset($_POST['section']) && $_POST['section'] === 'reports'
                ? ['feedback', 'report_avg_ratings', 'report_feedback_types', 'employee_trainings']
                : (isset($_POST['section']) && $_POST['section'] === 'projects'
                    ? ['projects']
                    : (isset($_POST['section']) && $_POST['section'] === 'tasks'
                        ? ['tasks']
                        : ['all'])));
        $data = fetchData($con, $manager_id, $sections);
        $response['success'] = true;
        $response = array_merge($response, $data);
    } elseif ($_POST['action'] === 'update_assignment') {
        $assignment_id = $_POST['assignment_id'];
        $role_in_project = $_POST['role_in_project'];
    
        // Validate inputs
        if (empty($assignment_id) || !is_numeric($assignment_id)) {
            $response['error'] = 'Invalid assignment ID';
            echo json_encode($response);
            exit();
        }
        if (empty($role_in_project)) {
            $response['error'] = 'Role in project is required';
            echo json_encode($response);
            exit();
        }
    
        try {
            $stmt = $con->prepare("
                UPDATE Assignment 
                SET role_in_project = :role_in_project
                WHERE assignment_id = :assignment_id
            ");
            $success = $stmt->execute([
                'role_in_project' => $role_in_project,
                'assignment_id' => $assignment_id
            ]);
    
            if ($success && $stmt->rowCount() > 0) {
                $response['success'] = true;
                $data = fetchData($con, $manager_id, ['projects', 'project_assignments']);
                $response = array_merge($response, $data);
            } else {
                $response['error'] = 'Assignment not found or no changes made';
            }
        } catch (PDOException $e) {
            $response['error'] = 'Database error: ' . $e->getMessage();
        }
    
        echo json_encode($response);
        exit();
    } elseif ($_POST['action'] === 'remove_assignment') {
        $assignment_id = $_POST['assignment_id'];
    
        // Validate assignment_id
        if (empty($assignment_id) || !is_numeric($assignment_id)) {
            $response['error'] = 'Invalid assignment ID';
            echo json_encode($response);
            exit();
        }
    
        try {
            $stmt = $con->prepare("
                DELETE FROM Assignment 
                WHERE assignment_id = :assignment_id
            ");
            $success = $stmt->execute(['assignment_id' => $assignment_id]);
    
            if ($success && $stmt->rowCount() > 0) {
                $response['success'] = true;
                // Fetch updated projects and project assignments
                $data = fetchData($con, $manager_id, ['projects', 'project_assignments']);
                $response = array_merge($response, $data);
            } else {
                $response['error'] = 'Assignment not found or already deleted';
            }
        } catch (PDOException $e) {
            $response['error'] = 'Database error: ' . $e->getMessage();
        }
    
        echo json_encode($response);
        exit();
    } elseif ($_POST['action'] === 'create_task' || $_POST['action'] === 'update_task') {
        $task_id = $_POST['task_id'] ?? null;
        $project_id = $_POST['project_id'] ?? null;
        $task_description = $_POST['task_description'] ?? null;
        $employee_id = $_POST['employee_id'] ?: null;
        $due_date = $_POST['due_date'] ?? null;
        $status = $_POST['status'] ?? null;
    
        // Basic validation for required fields
        if (!$project_id || !$task_description || !$due_date || !$status) {
            $response['error'] = 'Missing required fields for task';
            echo json_encode($response);
            exit;
        }
    
        try {
            if ($task_id && $_POST['action'] === 'update_task') {
                // Update Task
                $stmt = $con->prepare("UPDATE Task SET task_description = ?, status = ?, project_id = ? WHERE task_id = ?");
                $stmt->execute([$task_description, $status, $project_id, $task_id]);
    
                if ($stmt->rowCount() === 0) {
                    $response['error'] = 'Task not found';
                    echo json_encode($response);
                    exit;
                }
    
                // Update Assignment_Task
                $stmt = $con->prepare("DELETE FROM Assignment_Task WHERE task_id = ?");
                $stmt->execute([$task_id]);
    
                if ($employee_id) {
                    $stmt = $con->prepare("INSERT INTO Assignment_Task (task_id, employee_id, due_date) VALUES (?, ?, ?)");
                    $stmt->execute([$task_id, $employee_id, $due_date]);
                }
            } else {
                // Create Task
                $stmt = $con->prepare("INSERT INTO Task (task_description, status, project_id) VALUES (?, ?, ?)");
                $stmt->execute([$task_description, $status, $project_id]);
                $task_id = $con->lastInsertId();
    
                // Insert into Assignment_Task if employee_id provided
                if ($employee_id) {
                    $stmt = $con->prepare("INSERT INTO Assignment_Task (task_id, employee_id, due_date) VALUES (?, ?, ?)");
                    $stmt->execute([$task_id, $employee_id, $due_date]);
                }
            }
    
            $response['success'] = true;
        } catch (PDOException $e) {
            if ($e->getCode() == '23000' && strpos($e->getMessage(), 'Duplicate entry') !== false) {
                $response['error'] = 'Task description already exists. Please use a unique description.';
            } else {
                $response['error'] = 'Database error: ' . $e->getMessage();
            }
            echo json_encode($response);
            exit;
        }
    } elseif ($_POST['action'] === 'delete_task') {
        $task_id = $_POST['task_id'] ?? null;
        if (!$task_id) {
            $response['error'] = 'Task ID is required';
            echo json_encode($response);
            exit;
        }
    
        try {
            $stmt = $con->prepare("DELETE FROM Assignment_Task WHERE task_id = ?");
            $stmt->execute([$task_id]);
    
            $stmt = $con->prepare("DELETE FROM Task WHERE task_id = ?");
            $stmt->execute([$task_id]);
    
            if ($stmt->rowCount() === 0) {
                $response['error'] = 'Task not found';
            } else {
                $response['success'] = true;
            }
        } catch (PDOException $e) {
            $response['error'] = 'Database error: ' . $e->getMessage();
        }
    
        echo json_encode($response);
        exit;
    }
    echo json_encode($response);
    exit();
}
// Fetch departments with description and employee count
try {
    $stmt = $con->query("
        SELECT 
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


$data = fetchData($con, $manager_id);
$employees = $data['employees'];
$feedback = $data['feedback'];
$report_avg_ratings = $data['report_avg_ratings'];
$report_feedback_types = $data['report_feedback_types'];
$projects = $data['projects'];
$tasks = $data['tasks'];
$project_assignments = $data['project_assignments'];
$employee_trainings = $data['employee_trainings'] ?? [];
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
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_manager.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?> (Manager)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="Department_content" style="display: none;"></div>
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
        <!-- Projects Section -->
        <div id="projects-section" style="display: none;" class="card">
            <h2 style="font-size: 24px; color: #fff; background-color: #003087; padding: 10px; border-radius: 6px;">Project Status</h2>
            <div style="overflow-x: auto;">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Budget</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Client</th>
                        </tr>
                    </thead>
                    <tbody id="projects-table"></tbody>
                </table>
            </div>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)" style="margin: 10px;">Back</button>
            </div>
        </div>
        <!-- View/Edit Project Assignments Section -->
        <div id="project-assignments-section" style="display: none;" class="card">
            <h2 style="font-size: 24px; color: #fff; background-color: #003087; padding: 10px; border-radius: 6px;">View/Edit Project Assignments</h2>
            <div class="form-group">
                <label for="project_id_view">Select Project:</label>
                <select id="project_id_view" name="project_id_view">
                    <option value="">Select a project</option>
                </select>
            </div>
            <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Employee Name</th>
                            <th>Role in Project</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="assignments-table"></tbody>
                </table>
            </div>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage(event)" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Back</button>
            </div>
        </div>
        <!-- Edit Assignment Form (Hidden by Default) -->
        <div id="edit-assignment-section" style="display: none;" class="card">
            <h2 style="font-size: 24px; color: #fff; background-color: #003087; padding: 10px; border-radius: 6px;">Edit Assignment</h2>
            <form id="edit-assignment-form" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                <input type="hidden" id="assignment_id" name="assignment_id">
                <div class="form-group">
                    <label for="edit_project_id">Project:</label>
                    <input type="text" id="edit_project_id" name="project_name" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_employee_id">Employee:</label>
                    <input type="text" id="edit_employee_id" name="employee_name" readonly>
                </div>
                <div class="form-group">
                    <label for="edit_role_in_project">Role in Project:</label>
                    <input type="text" id="edit_role_in_project" name="role_in_project" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Save Changes</button>
                    <button type="button" onclick="showAssignedEmployeesSection()" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Back</button>
                </div>
            </form>
        </div>
        <!-- Subtasks Section -->
        <div id="subtasks-section" style="display: none;" class="card">
            <h2 style="font-size: 24px; color: #fff; background-color: #003087; padding: 10px; border-radius: 6px;">Manage Subtasks</h2>
            <form id="subtask-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <input type="hidden" id="task_id" name="task_id">
                <div class="form-group">
                    <label for="project_id_subtask" style="font-weight: 500;">Project:</label>
                    <select id="project_id_subtask" name="project_id" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;"></select>
                </div>
                <div class="form-group">
                    <label for="task_description" style="font-weight: 500;">Task Description:</label>
                    <input type="text" id="task_description" name="task_description" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                </div>
                <div class="form-group">
                    <label for="employee_id_subtask" style="font-weight: 500;">Assignee:</label>
                    <select id="employee_id_subtask" name="employee_id" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;"></select>
                </div>
                <div class="form-group">
                    <label for="due_date" style="font-weight: 500;">Due Date:</label>
                    <input type="date" id="due_date" name="due_date" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                </div>
                <div class="form-group">
                    <label for="task_status" style="font-weight: 500;">Status:</label>
                    <select id="task_status" name="status" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                <div class="form-group button-group" style="grid-column: span 2;">
                    <button type="button" id="save-task-btn" onclick="saveTask()" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Save Task</button>
                    <button type="button" id="delete-task-btn" onclick="deleteTask()" style="display: none; margin: 10px; background-color: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Delete Task</button>
                    <button type="button" onclick="resetSubtaskForm()" style="margin: 10px; background-color: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Clear</button>
                    <button type="button" onclick="showWelcomeMessage(event)" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Back</button>
                </div>
            </form>
            <div id="form-message" style="margin: 10px; color: #28a745;"></div>
            <h3 style="margin-top: 20px;">Existing Subtasks</h3>
            <div class="form-group" style="margin-bottom: 20px;">
                <label for="filter_project" style="font-weight: 500;">Filter by Project:</label>
                <select id="filter_project" onchange="renderTasksTable()" style="width: 200px; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="">All Projects</option>
                </select>
            </div>
            <div style="overflow-x: auto;">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Project</th>
                            <th>Assignee</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tasks-table"></tbody>
                </table>
            </div>
        </div>
        <!-- Assign Employees Section -->
        <div id="assign-employees-section" style="display: none;" class="card">
            <h2 style="font-size: 24px; color: #fff; background-color: #003087; padding: 10px; border-radius: 6px;">Assign Employee to Project</h2>
            <form id="assign-employees-form" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                <div class="form-group">
                    <label for="project_id">Project:</label>
                    <select id="project_id" name="project_id" required></select>
                </div>
                <div class="form-group">
                    <label for="employee_id">Employee:</label>
                    <select id="employee_id" name="employee_id" required></select>
                </div>
                <div class="form-group">
                    <label for="role_in_project">Role in Project:</label>
                    <input type="text" id="role_in_project" name="role_in_project" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Assign Employee</button>
                    <button type="button" onclick="showWelcomeMessage(event)" style="margin: 10px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Back</button>
                </div>
            </form>
        </div>

    </div>
    <script>
        const departments = <?php echo json_encode($departments ?: []); ?>;
        const employees = <?php echo json_encode($employees); ?>;
        const feedback = <?php echo json_encode($feedback); ?>;
        const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
        const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
        const projects = <?php echo json_encode($projects); ?>;
        const tasks = <?php echo json_encode($tasks); ?>;
        const projectAssignments = <?php echo json_encode($project_assignments); ?>;
        const employeeTrainings = <?php echo json_encode($employee_trainings); ?>;
        const userName = "<?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?>";
        const managerId = <?php echo json_encode($manager_id); ?>;
        console.log('Departments:', departments);


        document.addEventListener('DOMContentLoaded', function() {
            refreshData();
        });
    </script>
    <script src="../assets/js/dashboard.js"></script>
    <script src="../assets/js/manager_dashboard.js"></script>
</body>
</html>