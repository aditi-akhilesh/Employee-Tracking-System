<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../auth/dbconnect.php'; // Uses $con

// Rate limiting setup
$max_attempts = 5; // Maximum login attempts allowed
$lockout_time = 300; // Lockout duration in seconds (5 minutes)

// Initialize the attempts array if not set
if (!isset($_SESSION['login_attempts_by_user'])) {
    $_SESSION['login_attempts_by_user'] = [];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $role = trim($_POST['role']);

    // Check for rate limiting for this specific user (based on email)
    if (!isset($_SESSION['login_attempts_by_user'][$email])) {
        $_SESSION['login_attempts_by_user'][$email] = [
            'attempts' => 0,
            'last_attempt_time' => time()
        ];
    }

    $user_attempts = &$_SESSION['login_attempts_by_user'][$email];

    if ($user_attempts['attempts'] >= $max_attempts) {
        $time_since_last_attempt = time() - $user_attempts['last_attempt_time'];
        if ($time_since_last_attempt < $lockout_time) {
            $_SESSION['error'] = "Too many login attempts for this user. Please try again after " . ($lockout_time - $time_since_last_attempt) . " seconds.";
            header("Location: ../pages/login.php");
            exit();
        } else {
            // Reset attempts after lockout period
            $user_attempts['attempts'] = 0;
            $user_attempts['last_attempt_time'] = time();
        }
    }

    try {
        $stmt = $con->prepare("SELECT user_id, email, password_hash, role, first_name, last_name FROM Users WHERE email = :email AND role = :role");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Use password_verify for hashed password comparison
            if (password_verify($password, $user['password_hash'])) {
                // Reset login attempts for this user on successful login
                $user_attempts['attempts'] = 0;
                $user_attempts['last_attempt_time'] = time();

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

                // Insert into Audit_log table
                $action = "Login";
                $action_date = date('Y-m-d H:i:s'); // Current timestamp
                $stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
                $stmt_audit->bindParam(':user_id', $user['user_id']);
                $stmt_audit->bindParam(':action', $action);
                $stmt_audit->bindParam(':action_date', $action_date);
                $stmt_audit->execute();

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
                // Increment login attempts for this user on failure
                $user_attempts['attempts']++;
                $user_attempts['last_attempt_time'] = time();

                $_SESSION['error'] = "Incorrect password.";
            }
        } else {
            // Increment login attempts for this user on failure
            $user_attempts['attempts']++;
            $user_attempts['last_attempt_time'] = time();

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