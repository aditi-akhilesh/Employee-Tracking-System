<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../auth/dbconnect.php';

// after session_start() and PDO connect:
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit();
}

function validateDates($start_date, $end_date) {
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    return $end >= $start ? true : "End date must be after start date.";
}

$action = isset($_POST['action']) ? $_POST['action'] : '';

if ($action === 'add') {
    $training_name = filter_input(INPUT_POST, 'training_name', FILTER_SANITIZE_STRING);
    $training_date = $_POST['training_date'];
    $end_date = $_POST['end_date'];
    $certificate = filter_input(INPUT_POST, 'certificate', FILTER_SANITIZE_STRING);
    $department_id = $_POST['department_id'];

    try {
        if (empty($training_name)) throw new Exception("Training name is required.");
        $dateValidation = validateDates($training_date, $end_date);
        if ($dateValidation !== true) throw new Exception($dateValidation);

        $stmt = $con->prepare("SELECT COUNT(*) FROM Training WHERE training_name = ?");
        $stmt->execute([$training_name]);
        if ($stmt->fetchColumn() > 0) throw new Exception("Training '$training_name' already exists.");

        $stmt = $con->prepare("
            INSERT INTO Training (training_name, training_date, certificate, end_date, department_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$training_name, $training_date, $certificate, $end_date, $department_id]);
        $_SESSION['success'] = "Training '$training_name' added successfully!";
    } catch (Exception $e) {
        $_SESSION['error'] = $e->getMessage();
    }
    header("Location: ../hr_dashboard.php");
    exit();
}

if ($action === 'edit') {
    $training_id = $_POST['training_id'];
    $training_name = filter_input(INPUT_POST, 'training_name', FILTER_SANITIZE_STRING);
    $training_date = $_POST['training_date'];
    $end_date = $_POST['end_date'];
    $certificate = filter_input(INPUT_POST, 'certificate', FILTER_SANITIZE_STRING);
    $department_id = $_POST['department_id'];

    try {
        $dateValidation = validateDates($training_date, $end_date);
        if ($dateValidation !== true) throw new Exception($dateValidation);

        $stmt = $con->prepare("SELECT COUNT(*) FROM Training WHERE training_name = ? AND training_id != ?");
        $stmt->execute([$training_name, $training_id]);
        if ($stmt->fetchColumn() > 0) throw new Exception("Training name '$training_name' is already taken.");

        $stmt = $con->prepare("
            UPDATE Training 
            SET training_name = ?, training_date = ?, certificate = ?, end_date = ?, department_id = ?
            WHERE training_id = ?
        ");
        $stmt->execute([$training_name, $training_date, $certificate, $end_date, $department_id, $training_id]);
        $_SESSION['success'] = "Training updated successfully!";
    } catch (Exception $e) {
        $_SESSION['error'] = $e->getMessage();
    }
    header("Location: ../hr_dashboard.php");
    exit();
}

if ($action === 'delete') {
    header('Content-Type: application/json');
    $training_id = $_POST['training_id'];

    try {
        $stmt = $con->prepare("SELECT COUNT(*) FROM Employee_Training WHERE training_id = ? AND completion_status != 'Completed'");
        $stmt->execute([$training_id]);
        if ($stmt->fetchColumn() > 0) throw new Exception("Cannot delete training with active employee assignments.");

        $stmt = $con->prepare("DELETE FROM Employee_Training WHERE training_id = ?");
        $stmt->execute([$training_id]);

        $stmt = $con->prepare("DELETE FROM Training WHERE training_id = ?");
        $stmt->execute([$training_id]);

        echo json_encode(['success' => true, 'message' => 'Training deleted successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

if ($action === 'assign') {
    header('Content-Type: application/json');
    $training_id = $_POST['training_id'];
    $employee_id = $_POST['employee_id'];
    $enrollment_date = $_POST['enrollment_date'];

    try {
        $stmt = $con->prepare("SELECT COUNT(*) FROM Employee_Training WHERE employee_id = ? AND training_id = ?");
        $stmt->execute([$employee_id, $training_id]);
        if ($stmt->fetchColumn() > 0) throw new Exception("Employee is already assigned to this training.");

        $stmt = $con->prepare("
            INSERT INTO Employee_Training (employee_id, training_id, enrollment_date, completion_status)
            VALUES (?, ?, ?, 'Not Started')
        ");
        $stmt->execute([$employee_id, $training_id, $enrollment_date]);
        echo json_encode(['success' => true, 'message' => 'Employee assigned to training successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

if ($action === 'remove_assignment') {
    header('Content-Type: application/json');
    $employee_training_id = $_POST['employee_training_id'];

    try {
        $stmt = $con->prepare("DELETE FROM Employee_Training WHERE employee_training_id = ?");
        $stmt->execute([$employee_training_id]);
        echo json_encode(['success' => true, 'message' => 'Employee removed from training successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}
?>