<?php
// Disable display of errors to prevent HTML output
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Start output buffering to catch any unexpected output
ob_start();

session_start();
require_once '../../auth/dbconnect.php';

// Function to safely log messages
function safeLog($message) {
    $logFile = '/home/students/vkondoju/public_html/Employee-Tracking-System_working_old/pages/features/remove_employee_debug.log';
    // Check if the file is writable before attempting to write
    if (is_writable($logFile) || (!file_exists($logFile) && is_writable(dirname($logFile)))) {
        file_put_contents($logFile, $message, FILE_APPEND);
    } else {
        // Fallback: Log to PHP error log if file writing fails
        error_log("Failed to write to $logFile: $message");
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['employee_id'])) {
        throw new Exception("Invalid request");
    }

    // Log the request
    safeLog("Starting remove_employee.php\n");
    safeLog("Received POST data: " . print_r($_POST, true) . "\n");

    $employee_id = filter_var($_POST['employee_id'], FILTER_SANITIZE_NUMBER_INT);

    if (empty($employee_id)) {
        throw new Exception("Employee ID is required");
    }

    // Begin transaction
    $con->beginTransaction();

    // Step 1: Get the user_id from Employees table
    $stmt = $con->prepare("SELECT user_id FROM Employees WHERE employee_id = :employee_id");
    $stmt->bindParam(':employee_id', $employee_id, PDO::PARAM_INT);
    $stmt->execute();
    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$employee) {
        throw new Exception("Employee not found.");
    }
    $user_id = $employee['user_id'];

    // Step 2: Update is_active to 0 in Users table
    $stmt = $con->prepare("UPDATE Users SET is_active = 0 WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    // Step 3: Update emp_status to 'inactive' in Employees table
    $stmt = $con->prepare("UPDATE Employees SET emp_status = 'inactive' WHERE employee_id = :employee_id");
    $stmt->bindParam(':employee_id', $employee_id, PDO::PARAM_INT);
    $stmt->execute();

    // Commit the transaction
    $con->commit();

    // Log success
    safeLog("Employee deactivated successfully\n");

    // Clear output buffer and return JSON response
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Employee successfully deactivated']);
    exit();

} catch (Exception $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    // Log the error for debugging
    safeLog("Error in remove_employee.php: " . $e->getMessage() . "\n");
    // Clear output buffer and return JSON error response
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Error: " . $e->getMessage()]);
    exit();
}
?>