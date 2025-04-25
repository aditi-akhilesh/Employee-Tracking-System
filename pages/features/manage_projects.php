<?php
session_start();
include '../../auth/dbconnect.php';

// currentUser for audit log table
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'HR') {
    header("Location: ../login.php");
    exit();
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateDates($start_date, $expected_end_date, $actual_end_date = null) {
    $start = new DateTime($start_date);
    $expected = new DateTime($expected_end_date);
    $actual = $actual_end_date ? new DateTime($actual_end_date) : null;
    if ($expected < $start) return "Expected end date must be after start date.";
    if ($actual && $actual < $start) return "Actual end date must be after start date.";
    return true;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'add') {
            $project_name = trim($_POST['project_name']);
            $start_date = $_POST['start_date'];
            $expected_end_date = $_POST['expected_end_date'];
            $client_name = trim($_POST['client_name']);
            $client_contact_email = trim($_POST['client_contact_email']);
            $project_status = $_POST['project_status'];
            $budget = floatval($_POST['budget']);
            $department_id = $_POST['department_id'];

            // Validate inputs
            if (empty($project_name)) throw new Exception("Project name is required.");
            if (!validateEmail($client_contact_email)) throw new Exception("Invalid client email format.");
            if ($budget <= 0) throw new Exception("Budget must be a positive number.");
            $dateValidation = validateDates($start_date, $expected_end_date);
            if ($dateValidation !== true) throw new Exception($dateValidation);

            $stmt = $con->prepare("SELECT COUNT(*) FROM Projects WHERE project_name = :project_name");
            $stmt->execute(['project_name' => $project_name]);
            if ($stmt->fetchColumn() > 0) {
                $_SESSION['error'] = "Project name '$project_name' already exists.";
            } else {
                $stmt = $con->prepare("
                    INSERT INTO Projects (
                        project_name, start_date, expected_end_date, client_name, 
                        client_contact_email, project_status, budget, department_id
                    ) VALUES (:project_name, :start_date, :expected_end_date, :client_name, 
                        :client_contact_email, :project_status, :budget, :department_id)
                ");
                $stmt->execute([
                    'project_name' => $project_name,
                    'start_date' => $start_date,
                    'expected_end_date' => $expected_end_date,
                    'client_name' => $client_name,
                    'client_contact_email' => $client_contact_email,
                    'project_status' => $project_status,
                    'budget' => $budget,
                    'department_id' => $department_id
                ]);
                $_SESSION['success'] = "Project '$project_name' added successfully!";
            }
        } elseif ($action === 'edit') {
            $project_id = intval($_POST['project_id']);
            $project_name = trim($_POST['project_name']);
            $start_date = $_POST['start_date'];
            $expected_end_date = $_POST['expected_end_date'];
            $actual_end_date = $_POST['actual_end_date'] ?: null;
            $client_name = trim($_POST['client_name']);
            $client_contact_email = trim($_POST['client_contact_email']);
            $project_status = $_POST['project_status'];
            $budget = floatval($_POST['budget']);
            $actual_cost = $_POST['actual_cost'] ? floatval($_POST['actual_cost']) : null;
            $department_id = $_POST['department_id'];

            if (!validateEmail($client_contact_email)) throw new Exception("Invalid client email format.");
            if ($budget <= 0) throw new Exception("Budget must be a positive number.");
            if ($actual_cost !== null && $actual_cost < 0) throw new Exception("Actual cost cannot be negative.");
            $dateValidation = validateDates($start_date, $expected_end_date, $actual_end_date);
            if ($dateValidation !== true) throw new Exception($dateValidation);

            $stmt = $con->prepare("SELECT COUNT(*) FROM Projects WHERE project_name = :project_name AND project_id != :project_id");
            $stmt->execute(['project_name' => $project_name, 'project_id' => $project_id]);
            if ($stmt->fetchColumn() > 0) {
                $_SESSION['error'] = "Project name '$project_name' is already taken by another project.";
            } else {
                $stmt = $con->prepare("
                    UPDATE Projects
                    SET project_name = :project_name, start_date = :start_date, expected_end_date = :expected_end_date,
                        actual_end_date = :actual_end_date, client_name = :client_name, client_contact_email = :client_contact_email,
                        project_status = :project_status, budget = :budget, actual_cost = :actual_cost, department_id = :department_id
                    WHERE project_id = :project_id
                ");
                $stmt->execute([
                    'project_name' => $project_name,
                    'start_date' => $start_date,
                    'expected_end_date' => $expected_end_date,
                    'actual_end_date' => $actual_end_date,
                    'client_name' => $client_name,
                    'client_contact_email' => $client_contact_email,
                    'project_status' => $project_status,
                    'budget' => $budget,
                    'actual_cost' => $actual_cost,
                    'department_id' => $department_id,
                    'project_id' => $project_id
                ]);
                $_SESSION['success'] = "Project '$project_name' updated successfully!";
            }
        } elseif ($action === 'delete') {
            header('Content-Type: application/json');
            $project_id = intval($_POST['project_id']);
            $stmt = $con->prepare("DELETE FROM Projects WHERE project_id = :project_id");
            $stmt->execute(['project_id' => $project_id]);
            echo json_encode(['success' => true, 'message' => 'Project deleted successfully!']);
            exit();
        }
    } catch (Exception $e) {
        if (in_array($action, ['add', 'edit'])) {
            $_SESSION['error'] = $e->getMessage();
        } else {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit();
        }
    }
    header("Location: ../hr_dashboard.php");
    exit();
}
?>