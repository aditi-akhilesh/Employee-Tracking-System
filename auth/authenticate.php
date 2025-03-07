<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);
include '../auth/dbconnect.php'; // Ensure this file correctly establishes the database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']); // Note: Hash passwords before deploying in production
    $role = trim($_POST['role']);

    try {
        // Query to check if user exists with the given role
       $stmt = $con->prepare("SELECT email, password_hash, role, first_name, last_name FROM Users WHERE email = :email AND role = :role");        $stmt->bindParam(':email', $email);        
       $stmt->bindParam(':role', $role);        
       $stmt->execute();  
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Compare password (not hashed for now)
            if ($password === $user['password_hash']) { 
                // Store user session data
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['first_name'] . " " . $user['last_name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['role'] = $user['role'];

                // Redirect based on role
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
