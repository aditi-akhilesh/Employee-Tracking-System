<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../../auth/dbconnect.php'; // Ensure this path is correct

// Debug: Log session data at the start
file_put_contents('create_user_debug.log', "Session at start: " . print_r($_SESSION, true) . "\n", FILE_APPEND);

// Get the current HR user's employee_id
if (!isset($_SESSION['employee_id'])) {
    $current_user_id = $_SESSION['user_id'] ?? null;
    if ($current_user_id === null) {
        file_put_contents('create_user_debug.log', "User ID not set in session.\n", FILE_APPEND);
        $_SESSION['error'] = "User ID is not set in session. Please log in again.";
        header("Location: ../login.php");
        exit();
    }
    try {
        $stmt = $con->prepare("SELECT employee_id FROM Employees WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $current_user_id]);
        $hr_employee_id = $stmt->fetchColumn();
        if ($hr_employee_id === false) {
            file_put_contents('create_user_debug.log', "No employee record found for user_id: $current_user_id\n", FILE_APPEND);
            $_SESSION['error'] = "No employee record found for user_id: $current_user_id. Please contact the administrator.";
            header("Location: ../hr_dashboard.php");
            exit();
        }
        $_SESSION['employee_id'] = $hr_employee_id;
        file_put_contents('create_user_debug.log', "Set employee_id: $hr_employee_id\n", FILE_APPEND);
    } catch (PDOException $e) {
        file_put_contents('create_user_debug.log', "Database error fetching HR ID: " . $e->getMessage() . "\n", FILE_APPEND);
        $_SESSION['error'] = "Database error fetching HR ID: " . $e->getMessage();
        header("Location: ../hr_dashboard.php");
        exit();
    }
}
$hr_id = $_SESSION['employee_id'];

// Ensure hr_id is not empty
if (empty($hr_id)) {
    file_put_contents('create_user_debug.log', "HR ID is empty after setting.\n", FILE_APPEND);
    $_SESSION['error'] = "HR ID is missing. Please contact the administrator.";
    header("Location: ../hr_dashboard.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $first_name = trim($_POST['first_name']);
    $middle_name = trim($_POST['middle_name']) ?: null; // Optional, set to NULL if empty
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $dob = trim($_POST['dob']);
    $role = trim($_POST['role']);
    $department_id = trim($_POST['department_id']);
    $emp_hire_date = trim($_POST['emp_hire_date']);

    // Generate password as first_name@dob
    $password = $first_name . "@" . $dob;
    file_put_contents('create_user_debug.log', "Generated password: $password\n", FILE_APPEND);

    // Debug: Log the submitted data
    file_put_contents('create_user_post.log', "Submitted data: " . print_r($_POST, true) . "\n", FILE_APPEND);

    // Validate department_id by checking if it exists in the Department table
    try {
        $stmt_check_dept = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = :department_id");
        $stmt_check_dept->execute(['department_id' => $department_id]);
        if ($stmt_check_dept->fetchColumn() == 0) {
            $_SESSION['error'] = "Invalid department ID. Please select a valid department from the dropdown.";
            header("Location: ../hr_dashboard.php");
            exit();
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Error validating department: " . $e->getMessage();
        header("Location: ../hr_dashboard.php");
        exit();
    }

    // Restrict HR to creating only 'User' or 'Manager' roles
    if (!in_array($role, ['User', 'Manager'])) {
        $_SESSION['error'] = "HR can only create users with 'User' or 'Manager' roles.";
        header("Location: ../hr_dashboard.php");
        exit();
    }

    try {
        // Check if email already exists
        $stmt_check_email = $con->prepare("SELECT COUNT(*) FROM Users WHERE email = :email");
        $stmt_check_email->execute(['email' => $email]);
        if ($stmt_check_email->fetchColumn() > 0) {
            $_SESSION['error'] = "Email already exists.";
            header("Location: ../hr_dashboard.php");
            exit();
        }

        // Hash the generated password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        if ($hashed_password === false) {
            throw new Exception("Password hashing failed.");
        }

        // Insert into Users table with middle_name
        $sql_users = "INSERT INTO Users (first_name, middle_name, last_name, email, password_hash, role, is_active) 
                      VALUES (:first_name, :middle_name, :last_name, :email, :password, :role, 1)";
        $stmt_users = $con->prepare($sql_users);
        $stmt_users->execute([
            'first_name' => $first_name,
            'middle_name' => $middle_name,
            'last_name' => $last_name,
            'email' => $email,
            'password' => $hashed_password,
            'role' => $role
        ]);

        // Get the last inserted user ID
        $user_id = $con->lastInsertId();

        // Debug: Log hr_id before insert
        file_put_contents('create_user_hr_id.log', "HR ID before insert: $hr_id\n", FILE_APPEND);

        // Set is_hr and is_manager based on role
        $is_hr = ($role === 'HR') ? 1 : 0;
        $is_manager = ($role === 'Manager') ? 1 : 0;

        // Insert into Employees table
        $sql_employees = "INSERT INTO Employees (user_id, department_id, hr_id, DOB, emp_hire_date, is_hr, is_manager) 
                          VALUES (:user_id, :department_id, :hr_id, :dob, :emp_hire_date, :is_hr, :is_manager)";
        $stmt_employees = $con->prepare($sql_employees);
        $stmt_employees->execute([
            'user_id' => $user_id,
            'department_id' => $department_id,
            'hr_id' => $hr_id,
            'dob' => $dob,
            'emp_hire_date' => $emp_hire_date,
            'is_hr' => $is_hr,
            'is_manager' => $is_manager
        ]);

        $_SESSION['success'] = "User created successfully!;
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
    } catch (Exception $e) {
        $_SESSION['error'] = "Error: " . $e->getMessage();
    }

    header("Location: ../hr_dashboard.php");
    exit();
}