<?php
session_start();
require_once '../../auth/dbconnect.php'; // Your database connection file

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['employee_id'])) {
    $employee_id = filter_var($_POST['employee_id'], FILTER_SANITIZE_NUMBER_INT);

    try {
        // Begin transaction to ensure both updates succeed or fail together
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

        $_SESSION['success'] = "Employee successfully deactivated.";
    } catch (Exception $e) {
        // Roll back the transaction on error
        $con->rollBack();
        $_SESSION['error'] = "Failed to deactivate employee: " . $e->getMessage();
    }
} else {
    $_SESSION['error'] = "Invalid request.";
}

// Redirect back to HR dashboard
header("Location: ../../pages/hr_dashboard.php");
exit();
?>