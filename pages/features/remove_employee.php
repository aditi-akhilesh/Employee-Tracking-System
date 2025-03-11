<?php
session_start();
include '../../auth/dbconnect.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'HR') {
    header("Location: ../login.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $employee_id = intval($_POST['employee_id']);

    try {
        // Get user_id to delete from Users table
        $stmt = $con->prepare("SELECT user_id FROM Employees WHERE employee_id = :employee_id");
        $stmt->execute(['employee_id' => $employee_id]);
        $user_id = $stmt->fetchColumn();

        if ($user_id === false) {
            $_SESSION['error'] = "Employee not found.";
            header("Location: ../hr_dashboard.php");
            exit();
        }

        // Delete from Employees table
        $stmt = $con->prepare("DELETE FROM Employees WHERE employee_id = :employee_id");
        $stmt->execute(['employee_id' => $employee_id]);

        // Delete from Users table
        $stmt = $con->prepare("DELETE FROM Users WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $user_id]);

        $_SESSION['success'] = "Employee removed successfully!";
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
    }
}

header("Location: ../hr_dashboard.php");
exit();
?>