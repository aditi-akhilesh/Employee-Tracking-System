<?php
session_start();
require_once '../../auth/dbconnect.php';


// after session_start() and PDO connect:
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");


header('Content-Type: application/json');
$response = ['success' => false, 'error' => ''];

try {
    // Check if manager is logged in
    if (!isset($_SESSION['employee_id'])) {
        throw new Exception('Unauthorized access: Manager not logged in');
    }

    $manager_id = $_SESSION['employee_id'];

    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Determine the action
    $action = isset($_POST['action']) ? $_POST['action'] : 'create';

    if ($action === 'create') {
        // Get and validate form data for creating an assignment
        $project_id = isset($_POST['project_id']) ? intval($_POST['project_id']) : 0;
        $employee_id = isset($_POST['employee_id']) ? intval($_POST['employee_id']) : 0;
        $role_in_project = isset($_POST['role_in_project']) ? trim($_POST['role_in_project']) : '';

        if ($project_id <= 0) {
            throw new Exception('Invalid project ID');
        }
        if ($employee_id <= 0) {
            throw new Exception('Invalid employee ID');
        }
        if (empty($role_in_project)) {
            throw new Exception('Role in project is required');
        }

        // Verify the project exists
        $stmt = $con->prepare("SELECT COUNT(*) FROM Projects WHERE project_id = :project_id");
        $stmt->execute(['project_id' => $project_id]);
        if ($stmt->fetchColumn() == 0) {
            throw new Exception('Project does not exist');
        }

        // Verify the employee exists and is under the manager
        $stmt = $con->prepare("
            SELECT COUNT(*) FROM Employees 
            WHERE employee_id = :employee_id AND manager_id = :manager_id
        ");
        $stmt->execute(['employee_id' => $employee_id, 'manager_id' => $manager_id]);
        if ($stmt->fetchColumn() == 0) {
            throw new Exception('Employee does not exist or is not under your management');
        }

        // Check if employee is already assigned to the project
        $stmt = $con->prepare("
            SELECT COUNT(*) FROM Assignment 
            WHERE project_id = :project_id AND employee_id = :employee_id
        ");
        $stmt->execute(['project_id' => $project_id, 'employee_id' => $employee_id]);
        if ($stmt->fetchColumn() > 0) {
            throw new Exception('Employee is already assigned to this project');
        }

        // Insert into Assignment table
        $stmt = $con->prepare("
            INSERT INTO Assignment (employee_id, project_id, role_in_project, reporting_manager_id)
            VALUES (:employee_id, :project_id, :role_in_project, :reporting_manager_id)
        ");
        $stmt->execute([
            'employee_id' => $employee_id,
            'project_id' => $project_id,
            'role_in_project' => $role_in_project,
            'reporting_manager_id' => $manager_id
        ]);

        $response['success'] = true;

    } elseif ($action === 'update') {
        // Get and validate form data for updating an assignment
        $assignment_id = isset($_POST['assignment_id']) ? intval($_POST['assignment_id']) : 0;
        $role_in_project = isset($_POST['role_in_project']) ? trim($_POST['role_in_project']) : '';

        if ($assignment_id <= 0) {
            throw new Exception('Invalid assignment ID');
        }
        if (empty($role_in_project)) {
            throw new Exception('Role in project is required');
        }

        // Verify the assignment exists and is under the manager
        $stmt = $con->prepare("
            SELECT COUNT(*) FROM Assignment 
            WHERE assignment_id = :assignment_id AND reporting_manager_id = :manager_id
        ");
        $stmt->execute(['assignment_id' => $assignment_id, 'manager_id' => $manager_id]);
        if ($stmt->fetchColumn() == 0) {
            throw new Exception('Assignment does not exist or you do not have permission to edit it');
        }

        // Update the assignment
        $stmt = $con->prepare("
            UPDATE Assignment 
            SET role_in_project = :role_in_project
            WHERE assignment_id = :assignment_id
        ");
        $stmt->execute([
            'role_in_project' => $role_in_project,
            'assignment_id' => $assignment_id
        ]);

        $response['success'] = true;

    } elseif ($action === 'delete') {
        // Get and validate form data for deleting an assignment
        $assignment_id = isset($_POST['assignment_id']) ? intval($_POST['assignment_id']) : 0;

        if ($assignment_id <= 0) {
            throw new Exception('Invalid assignment ID');
        }

        // Verify the assignment exists and is under the manager
        $stmt = $con->prepare("
            SELECT COUNT(*) FROM Assignment 
            WHERE assignment_id = :assignment_id AND reporting_manager_id = :manager_id
        ");
        $stmt->execute(['assignment_id' => $assignment_id, 'manager_id' => $manager_id]);
        if ($stmt->fetchColumn() == 0) {
            throw new Exception('Assignment does not exist or you do not have permission to delete it');
        }

        // Delete the assignment
        $stmt = $con->prepare("DELETE FROM Assignment WHERE assignment_id = :assignment_id");
        $stmt->execute(['assignment_id' => $assignment_id]);

        $response['success'] = true;

    } else {
        throw new Exception('Invalid action');
    }

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    error_log("Assignment Error: " . $e->getMessage());
} catch (PDOException $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
    error_log("Assignment PDO Error: " . $e->getMessage());
}

echo json_encode($response);
exit;
?>