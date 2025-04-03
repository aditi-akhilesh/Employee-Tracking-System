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
    $logFile = '/home/students/vkondoju/public_html/Employee-Tracking-System_working_old/pages/features/update_employee_debug.log';
    // Check if the file is writable before attempting to write
    if (is_writable($logFile) || (!file_exists($logFile) && is_writable(dirname($logFile)))) {
        file_put_contents($logFile, $message, FILE_APPEND);
    } else {
        // Fallback: Log to PHP error log if file writing fails
        error_log("Failed to write to $logFile: $message");
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Log the received POST data for debugging
    safeLog("Starting update_employee.php\n");
    safeLog("Received POST data: " . print_r($_POST, true) . "\n");

    // Sanitize and validate input
    $employee_id = filter_var($_POST['employee_id'] ?? '', FILTER_SANITIZE_NUMBER_INT);
    $first_name = htmlspecialchars(trim($_POST['first_name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $last_name = htmlspecialchars(trim($_POST['last_name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $role = htmlspecialchars(trim($_POST['role'] ?? ''), ENT_QUOTES, 'UTF-8');
    $department_id = htmlspecialchars(trim($_POST['department_id'] ?? ''), ENT_QUOTES, 'UTF-8');
    $emp_hire_date = htmlspecialchars(trim($_POST['emp_hire_date'] ?? ''), ENT_QUOTES, 'UTF-8');
    $salary = filter_var($_POST['salary'] ?? '', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $manager_id = isset($_POST['manager_id']) ? htmlspecialchars(trim($_POST['manager_id'] ?? ''), ENT_QUOTES, 'UTF-8') : null;

    // Validate required fields
    if (empty($employee_id) || empty($first_name) || empty($last_name) || empty($email) || empty($role) || empty($department_id) || empty($emp_hire_date) || empty($salary)) {
        throw new Exception("Required fields are missing");
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Validate salary (must be a positive number)
    if ($salary <= 0) {
        throw new Exception("Salary must be a positive number");
    }

    // Validate hire date (must be a valid date and not in the future)
    $hireDate = DateTime::createFromFormat('Y-m-d', $emp_hire_date);
    $today = new DateTime();
    if (!$hireDate || $hireDate > $today) {
        throw new Exception("Hire date must be a valid date and not in the future");
    }

    // Validate department_id exists
    $checkDept = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = :department_id");
    $checkDept->execute([':department_id' => $department_id]);
    if ($checkDept->fetchColumn() == 0) {
        throw new Exception("Invalid department ID: $department_id does not exist");
    }

    // Validate manager_id if provided (for Users)
    if ($role === 'User' && !empty($manager_id)) {
        $checkManager = $con->prepare("SELECT COUNT(*) FROM Employees e JOIN Users u ON e.user_id = u.user_id WHERE e.employee_id = :manager_id AND u.role = 'Manager'");
        $checkManager->execute([':manager_id' => $manager_id]);
        if ($checkManager->fetchColumn() == 0) {
            throw new Exception("Invalid manager ID: $manager_id does not exist or is not a Manager");
        }

        // Ensure the department_id matches the manager's department
        $stmtManagerDept = $con->prepare("SELECT department_id FROM Employees WHERE employee_id = :manager_id");
        $stmtManagerDept->execute([':manager_id' => $manager_id]);
        $manager_department_id = $stmtManagerDept->fetchColumn();
        if ($manager_department_id !== $department_id) {
            throw new Exception("Department ID does not match the selected manager's department.");
        }
    }

    if (!$con) {
        throw new Exception("Database connection failed");
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

    // Step 2: Update Users table
    $sqlUser = "UPDATE Users 
                SET 
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    role = :role
                WHERE user_id = :user_id";
    $stmtUser = $con->prepare($sqlUser);
    $stmtUser->execute([
        ':first_name' => $first_name,
        ':last_name' => $last_name,
        ':email' => $email,
        ':role' => $role,
        ':user_id' => $user_id
    ]);

    // Step 3: Update Employees table
    $is_manager = ($role === 'Manager') ? 1 : 0;
    $manager_id = ($role === 'Manager') ? null : $manager_id; // Set manager_id to NULL if role is Manager

    $sqlEmployee = "UPDATE Employees 
                    SET 
                        department_id = :department_id,
                        emp_hire_date = :emp_hire_date,
                        salary = :salary,
                        manager_id = :manager_id,
                        is_manager = :is_manager
                    WHERE employee_id = :employee_id";
    $stmtEmployee = $con->prepare($sqlEmployee);
    $stmtEmployee->execute([
        ':department_id' => $department_id,
        ':emp_hire_date' => $emp_hire_date,
        ':salary' => $salary,
        ':manager_id' => $manager_id,
        ':is_manager' => $is_manager,
        ':employee_id' => $employee_id
    ]);

    // Commit the transaction
    $con->commit();

    // Log success
    safeLog("Employee updated successfully\n");

    // Clear output buffer and return JSON response
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
    exit();

} catch (Exception $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    // Log the error for debugging
    safeLog("Error in update_employee.php: " . $e->getMessage() . "\n");
    // Clear output buffer and return JSON error response
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Error: " . $e->getMessage()]);
    exit();
}
?>