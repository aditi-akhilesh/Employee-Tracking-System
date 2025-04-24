<?php
// Suppress error output; log errors instead
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Start output buffering to capture any unintended output
ob_start();

session_start();
require_once '../../auth/dbconnect.php';

// Log start of script
file_put_contents('debug.log', "Starting create_user_admin.php\n", FILE_APPEND);

header('Content-Type: application/json');

try {
    // Check database connection
    if (!isset($con) || !$con) {
        throw new Exception("Database connection failed");
    }
    file_put_contents('debug.log', "Database connection successful\n", FILE_APPEND);

    // Check if the user is authenticated and has Super Admin role
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized: User is not authenticated");
    }
    file_put_contents('debug.log', "User ID: " . $_SESSION['user_id'] . "\n", FILE_APPEND);

    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Super Admin') {
        throw new Exception("Unauthorized: Only Super Admin can create users. Current role: " . ($_SESSION['role'] ?? 'not set'));
    }
    file_put_contents('debug.log', "Role check passed: " . $_SESSION['role'] . "\n", FILE_APPEND);

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception("Invalid request method");
    }

    // Retrieve and sanitize form data
    $first_name = trim($_POST['first_name'] ?? '');
    $middle_name = trim($_POST['middle_name'] ?? '') ?: null;
    $last_name = trim($_POST['last_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone_number = trim($_POST['phone_number'] ?? '');
    $dob = trim($_POST['dob'] ?? '');
    $role = trim($_POST['role'] ?? '');
    $department_id = trim($_POST['department_id'] ?? '');
    $emp_hire_date = trim($_POST['emp_hire_date'] ?? '');
    $salary = trim($_POST['salary'] ?? '');
    $emp_job_title = trim($_POST['emp_job_title'] ?? '');
    $manager_id = isset($_POST['manager_id']) && !empty($_POST['manager_id']) ? trim($_POST['manager_id']) : null;

    // Log submitted data for debugging
    file_put_contents('create_user_post.log', "Submitted data: " . print_r($_POST, true) . "\n", FILE_APPEND);
    file_put_contents('debug.log', "Form data retrieved\n", FILE_APPEND);

    // Validate required fields
    if (empty($first_name) || empty($last_name) || empty($email) || empty($phone_number) || empty($dob) || empty($emp_hire_date) || empty($salary) || empty($role) || empty($emp_job_title) || empty($department_id)) {
        throw new Exception("All required fields must be filled");
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Validate phone number
    if (!preg_match('/^[0-9]{10}$/', $phone_number)) {
        throw new Exception("Phone number must be exactly 10 digits");
    }

    // Validate DOB
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
        throw new Exception("Invalid date of birth format. Use YYYY-MM-DD");
    }
    $dobDate = new DateTime($dob);
    $currentDate = new DateTime();
    $ageInterval = $currentDate->diff($dobDate);
    $age = $ageInterval->y;
    if ($age < 18) {
        throw new Exception("User must be at least 18 years old");
    }

    // Validate hire date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $emp_hire_date)) {
        throw new Exception("Invalid hire date format. Use YYYY-MM-DD");
    }
    // Super Admin can set future hire dates, so no restriction here

    // Validate salary
    if (!is_numeric($salary) || floatval($salary) <= 0) {
        throw new Exception("Salary must be a positive number");
    }

    // Validate job title
    if (!preg_match('/^[A-Za-z ]+$/', $emp_job_title)) {
        throw new Exception("Job title must contain only letters and spaces");
    }

    // Validate role
    file_put_contents('debug.log', "Validating role: $role\n", FILE_APPEND);
    if (!in_array($role, ['User', 'Manager', 'HR'])) {
        throw new Exception("Invalid role: $role. Allowed roles: User, Manager, HR");
    }

    // Validate department_id
    file_put_contents('debug.log', "Validating department_id: $department_id\n", FILE_APPEND);
    $stmt_check_dept = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = :department_id");
    $stmt_check_dept->execute(['department_id' => $department_id]);
    if ($stmt_check_dept->fetchColumn() == 0) {
        throw new Exception("Invalid department ID: $department_id. Please select a valid department");
    }

    // For HR role, ensure department_id is D02
    if ($role === 'HR' && $department_id !== 'D02') {
        throw new Exception("HR role must be assigned to HR Department (D02)");
    }

    // Validate manager_id and department_id for 'User' role
    if ($role === 'User') {
        if (!$manager_id) {
            throw new Exception("A manager must be selected for users with the 'User' role");
        }

        // Validate manager_id
        $stmt_check_manager = $con->prepare("SELECT COUNT(*) FROM Employees e JOIN Users u ON e.user_id = u.user_id WHERE e.employee_id = :manager_id AND u.role = 'Manager'");
        $stmt_check_manager->execute(['manager_id' => $manager_id]);
        if ($stmt_check_manager->fetchColumn() == 0) {
            throw new Exception("Invalid manager ID: $manager_id. Please select a valid manager");
        }

        // Get the manager's department_id
        $stmt_manager_dept = $con->prepare("SELECT department_id FROM Employees WHERE employee_id = :manager_id");
        $stmt_manager_dept->execute(['manager_id' => $manager_id]);
        $manager_department_id = $stmt_manager_dept->fetchColumn();

        // Ensure the submitted department_id matches the manager's department
        if ($manager_department_id != $department_id) {
            throw new Exception("Department ID ($department_id) does not match the selected manager's department ($manager_department_id)");
        }
    } else {
        $manager_id = null;
    }

    // Check if email already exists
    file_put_contents('debug.log', "Checking email: $email\n", FILE_APPEND);
    $stmt_check_email = $con->prepare("SELECT COUNT(*) FROM Users WHERE email = :email");
    $stmt_check_email->execute(['email' => $email]);
    if ($stmt_check_email->fetchColumn() > 0) {
        throw new Exception("Email already exists");
    }

    // Generate password
    $password = $first_name . "@" . $dob;
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    if ($hashed_password === false) {
        throw new Exception("Password hashing failed");
    }

    // Begin transaction
    file_put_contents('debug.log', "Starting transaction\n", FILE_APPEND);
    $con->beginTransaction();

    // Insert into Users table
    file_put_contents('debug.log', "Inserting into Users table\n", FILE_APPEND);
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

    // Set is_hr and is_manager based on role
    $is_hr = ($role === 'HR') ? 1 : 0;
    $is_manager = ($role === 'Manager') ? 1 : 0;

    // Insert into Employees table
    file_put_contents('debug.log', "Inserting into Employees table\n", FILE_APPEND);
    $sql_employees = "INSERT INTO Employees (user_id, department_id, DOB, emp_hire_date, salary, is_hr, is_manager, manager_id, emp_job_title) 
                      VALUES (:user_id, :department_id, :dob, :emp_hire_date, :salary, :is_hr, :is_manager, :manager_id, :emp_job_title)";
    $stmt_employees = $con->prepare($sql_employees);
    $stmt_employees->execute([
        'user_id' => $user_id,
        'department_id' => $department_id,
        'dob' => $dob,
        'emp_hire_date' => $emp_hire_date,
        'salary' => floatval($salary),
        'is_hr' => $is_hr,
        'is_manager' => $is_manager,
        'manager_id' => $manager_id,
        'emp_job_title' => $emp_job_title
    ]);

    // Commit transaction
    file_put_contents('debug.log', "Committing transaction\n", FILE_APPEND);
    $con->commit();

    // Insert into Audit_Log table for user creation
    file_put_contents('debug.log', "Logging audit\n", FILE_APPEND);
    $action = "Create User";
    $action_date = date('Y-m-d H:i:s');
    $stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
    $stmt_audit->execute([
        ':user_id' => $_SESSION['user_id'],
        ':action' => $action,
        ':action_date' => $action_date
    ]);

    ob_end_clean();
    echo json_encode(['success' => true, 'message' => "User created successfully! Temporary password: $password"]);
} catch (Exception $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    $error_message = "Error in create_user_admin.php: " . $e->getMessage();
    file_put_contents('debug.log', "$error_message\n", FILE_APPEND);
    error_log($error_message);
    ob_end_clean();
    echo json_encode(['error' => 'Error creating user: ' . $e->getMessage()]);
} catch (PDOException $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    $error_message = "Database error in create_user_admin.php: " . $e->getMessage();
    file_put_contents('debug.log', "$error_message\n", FILE_APPEND);
    error_log($error_message);
    ob_end_clean();
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>