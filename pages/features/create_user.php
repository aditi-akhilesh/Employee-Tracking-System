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
    $phone_number = trim($_POST['phone_number']);
    $dob = trim($_POST['dob']);
    $role = trim($_POST['role']);
    $department_id = trim($_POST['department_id']);
    $emp_hire_date = trim($_POST['emp_hire_date']);
    $salary = trim($_POST['salary']);
    $manager_id = isset($_POST['manager_id']) && !empty($_POST['manager_id']) ? trim($_POST['manager_id']) : null;

    // Server-side validation for salary
    if (!is_numeric($salary) || floatval($salary) <= 0) {
        file_put_contents('create_user_debug.log', "Salary validation failed: Invalid salary $salary\n", FILE_APPEND);
        $_SESSION['error'] = "Salary must be a positive number.";
        header("Location: ../hr_dashboard.php");
        exit();
    }

    // Validate DOB (server-side)
    $dobDate = new DateTime($dob);
    $currentDate = new DateTime();
    $ageInterval = $currentDate->diff($dobDate);
    $age = $ageInterval->y;
    if ($age < 18) {
        file_put_contents('create_user_debug.log', "DOB validation failed: Age $age is less than 18 for DOB $dob\n", FILE_APPEND);
        $_SESSION['error'] = "User must be at least 18 years old.";
        header("Location: ../hr_dashboard.php");
        exit();
    }

    // Generate password as first_name@dob
    $password = $first_name . "@" . $dob;
    file_put_contents('create_user_debug.log', "Generated password: $password\n", FILE_APPEND);

    // Debug: Log the submitted data
    file_put_contents('create_user_post.log', "Submitted data: " . print_r($_POST, true) . "\n", FILE_APPEND);

    // Validate department_id
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

    // Validate manager_id and department_id for 'User' role
    if ($role === 'User') {
        if (!$manager_id) {
            $_SESSION['error'] = "A manager must be selected for users with the 'User' role.";
            header("Location: ../hr_dashboard.php");
            exit();
        }

        try {
            // Validate manager_id
            $stmt_check_manager = $con->prepare("SELECT COUNT(*) FROM Employees e JOIN Users u ON e.user_id = u.user_id WHERE e.employee_id = :manager_id AND u.role = 'Manager'");
            $stmt_check_manager->execute(['manager_id' => $manager_id]);
            if ($stmt_check_manager->fetchColumn() == 0) {
                $_SESSION['error'] = "Invalid manager ID. Please select a valid manager from the dropdown.";
                header("Location: ../hr_dashboard.php");
                exit();
            }

            // Get the manager's department_id
            $stmt_manager_dept = $con->prepare("SELECT department_id FROM Employees WHERE employee_id = :manager_id");
            $stmt_manager_dept->execute(['manager_id' => $manager_id]);
            $manager_department_id = $stmt_manager_dept->fetchColumn();

            // Ensure the submitted department_id matches the manager's department
            if ($manager_department_id !== $department_id) {
                $_SESSION['error'] = "Department ID does not match the selected manager's department.";
                header("Location: ../hr_dashboard.php");
                exit();
            }
        } catch (PDOException $e) {
            $_SESSION['error'] = "Error validating manager or department: " . $e->getMessage();
            header("Location: ../hr_dashboard.php");
            exit();
        }
    } else {
        // For 'Manager' role, ensure no manager_id is set
        $manager_id = null;
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

        // Insert into Users table with phone_number
        $sql_users = "INSERT INTO Users (first_name, middle_name, last_name, email, phone_number, password_hash, role, is_active) 
                      VALUES (:first_name, :middle_name, :last_name, :email, :phone_number, :password, :role, 1)";
        $stmt_users = $con->prepare($sql_users);
        $stmt_users->execute([
            'first_name' => $first_name,
            'middle_name' => $middle_name,
            'last_name' => $last_name,
            'email' => $email,
            'phone_number' => $phone_number,
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

        // Insert into Employees table with salary and manager_id
        $sql_employees = "INSERT INTO Employees (user_id, department_id, hr_id, DOB, emp_hire_date, salary, is_hr, is_manager, manager_id) 
                          VALUES (:user_id, :department_id, :hr_id, :dob, :emp_hire_date, :salary, :is_hr, :is_manager, :manager_id)";
        $stmt_employees = $con->prepare($sql_employees);
        $stmt_employees->execute([
            'user_id' => $user_id,
            'department_id' => $department_id,
            'hr_id' => $hr_id,
            'dob' => $dob,
            'emp_hire_date' => $emp_hire_date,
            'salary' => floatval($salary),
            'is_hr' => $is_hr,
            'is_manager' => $is_manager,
            'manager_id' => $manager_id
        ]);

        $_SESSION['success'] = "User created successfully!";
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
    } catch (Exception $e) {
        $_SESSION['error'] = "Error: " . $e->getMessage();
    }

    header("Location: ../hr_dashboard.php");
    exit();
}