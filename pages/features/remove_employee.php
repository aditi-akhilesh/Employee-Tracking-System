<?php
// Disable display of errors to prevent HTML output
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

ob_start();

session_start();
require_once '../../auth/dbconnect.php';

function safeLog($message) {
    $logFile = __DIR__ . '/remove_employee_debug.log'; // Updated to relative path for consistency
    $timestamp = date('Y-m-d H:i:s');
    $formattedMessage = "[$timestamp] $message\n";
    if (file_put_contents($logFile, $formattedMessage, FILE_APPEND) === false) {
        error_log("Failed to write to $logFile: $message");
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['employee_id'])) {
        throw new Exception("Invalid request");
    }

    // Check if the user is authenticated and has HR role
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized: User is not authenticated");
    }

    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'HR') {
        throw new Exception("Unauthorized: Only HR can deactivate employees");
    }

    $current_user_id = $_SESSION['user_id'];

    // safeLog("Starting remove_employee.php");
    // safeLog("Received POST data: " . print_r($_POST, true));

    $employee_id = filter_var($_POST['employee_id'], FILTER_SANITIZE_NUMBER_INT);

    if (empty($employee_id)) {
        throw new Exception("Employee ID is required");
    }

    // Begin transaction
    $con->beginTransaction();

    // Step 1: Get the employee details including role and user_id
    $stmt = $con->prepare("SELECT e.user_id, e.employee_id, u.role 
                           FROM Employees e 
                           JOIN Users u ON e.user_id = u.user_id 
                           WHERE e.employee_id = :employee_id");
    $stmt->execute([':employee_id' => $employee_id]);
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employee) {
        throw new Exception("Employee not found.");
    }
    $user_id = $employee['user_id'];

    // Step 2: Check if the employee is a Manager with subordinates
    if ($employee['role'] === 'Manager') {
        $checkSubordinates = $con->prepare("SELECT COUNT(*) FROM Employees WHERE manager_id = :manager_id AND employee_id != :employee_id AND emp_status = 'Active'");
        $checkSubordinates->execute([':manager_id' => $employee_id, ':employee_id' => $employee_id]);
        $subordinateCount = $checkSubordinates->fetchColumn();
        if ($subordinateCount > 0) {
            throw new Exception("Cannot deactivate this manager: They have $subordinateCount active employee(s) assigned.");
        }
    }

    // Step 3: Update is_active to 0 in Users table
    $stmt = $con->prepare("UPDATE Users SET is_active = 0 WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $user_id]);

    // Step 4: Update emp_status to 'inactive' in Employees table
    $stmt = $con->prepare("UPDATE Employees SET emp_status = 'inactive' WHERE employee_id = :employee_id");
    $stmt->execute([':employee_id' => $employee_id]);

    // Commit the transaction
    $con->commit();

    // Insert into Audit_Log table for employee deactivation
    $action = "Deactivate Employee";
    $action_date = date('Y-m-d H:i:s');
    $stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
    $stmt_audit->bindParam(':user_id', $current_user_id);
    $stmt_audit->bindParam(':action', $action);
    $stmt_audit->bindParam(':action_date', $action_date);
    try {
        $stmt_audit->execute();
    } catch (PDOException $e) {
        safeLog("Audit log insertion failed in " . __FILE__ . " on line " . __LINE__ . ": " . $e->getMessage());
    }

    // safeLog("Employee deactivated successfully");

    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Employee successfully deactivated']);
    exit();

} catch (Exception $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    // safeLog("Error in remove_employee.php: " . $e->getMessage());
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Error: " . $e->getMessage()]);
    exit();
}
?>