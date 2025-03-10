<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../auth/dbconnect.php'; // Uses $con

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $role = trim($_POST['role']);

    try {
        $stmt = $con->prepare("SELECT user_id, email, password_hash, role, first_name, last_name FROM Users WHERE email = :email AND role = :role");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Use password_verify for hashed password comparison
            if (password_verify($password, $user['password_hash'])) {
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['user_name'] = $user['first_name'] . " " . $user['last_name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['role'] = $user['role'];

                // Debug: Log session data with timestamp
                $log_data = date('Y-m-d H:i:s') . " - " . print_r($_SESSION, true);
                file_put_contents('session_debug.log', $log_data . "\n", FILE_APPEND);

                // Optionally fetch employee_id here if needed
                $stmt_emp = $con->prepare("SELECT employee_id FROM Employees WHERE user_id = :user_id");
                $stmt_emp->execute(['user_id' => $user['user_id']]);
                $employee_id = $stmt_emp->fetchColumn();
                if ($employee_id !== false) {
                    $_SESSION['employee_id'] = $employee_id;
                } else {
                    // Log warning but allow login if employee_id is missing
                    file_put_contents('session_debug.log', date('Y-m-d H:i:s') . " - Warning: No employee_id found for user_id: " . $user['user_id'] . "\n", FILE_APPEND);
                }

                switch ($user['role']) {
                    case 'Super Admin':
                        header("Location: ../pages/superadmin_dashboard.php");
                        break;
                    case 'HR':
                        header("Location: ../pages/hr_dashboard.php");
                        break;
                    case 'Manager':
                        header("Location: ../pages/manager_dashboard.php");
                        break;
                    case 'User':
                        header("Location: ../pages/user_dashboard.php");
                        break;
                    default:
                        $_SESSION['error'] = "Invalid role assignment!";
                        header("Location: ../pages/login.php");
                        break;
                }
                exit();
            } else {
                $_SESSION['error'] = "Incorrect password.";
            }
        } else {
            $_SESSION['error'] = "User not found or role mismatch.";
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
    }

    header("Location: ../pages/login.php");
    exit();
} else {
    $_SESSION['error'] = "Invalid request method.";
    header("Location: ../pages/login.php");
    exit();
}
?>