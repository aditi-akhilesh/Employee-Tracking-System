<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
//require_once '../includes/auth_check.php';
require_once '../../auth/dbconnect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    error_log("Received POST data: " . print_r($_POST, true));

    $employee_id = filter_input(INPUT_POST, 'employee_id', FILTER_SANITIZE_NUMBER_INT);
    $first_name = filter_input(INPUT_POST, 'first_name', FILTER_SANITIZE_STRING);
    $last_name = filter_input(INPUT_POST, 'last_name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $role = filter_input(INPUT_POST, 'role', FILTER_SANITIZE_STRING);
    $department_id = filter_input(INPUT_POST, 'department_id', FILTER_SANITIZE_STRING); // Changed to STRING
    $emp_hire_date = filter_input(INPUT_POST, 'emp_hire_date', FILTER_SANITIZE_STRING);
    $salary = filter_input(INPUT_POST, 'salary', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

    if (empty($employee_id) || empty($first_name) || empty($last_name) || empty($email) || empty($role) || empty($department_id)) {
        throw new Exception("Required fields are missing");
    }

    // Validate department_id exists
    $checkDept = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = :department_id");
    $checkDept->execute([':department_id' => $department_id]);
    if ($checkDept->fetchColumn() == 0) {
        throw new Exception("Invalid department ID: $department_id does not exist");
    }

    if (!$con) {
        throw new Exception("Database connection failed");
    }

    $sql = "UPDATE Employees e
            JOIN Users u ON e.user_id = u.user_id
            SET 
                u.first_name = :first_name,
                u.last_name = :last_name,
                u.email = :email,
                u.role = :role,
                e.department_id = :department_id,
                e.emp_hire_date = :emp_hire_date,
                e.salary = :salary
            WHERE e.employee_id = :employee_id";

    $stmt = $con->prepare($sql);
    $stmt->execute([
        ':first_name' => $first_name,
        ':last_name' => $last_name,
        ':email' => $email,
        ':role' => $role,
        ':department_id' => $department_id,
        ':emp_hire_date' => $emp_hire_date,
        ':salary' => $salary,
        ':employee_id' => $employee_id
    ]);

    if ($stmt->rowCount() > 0) {
        $_SESSION['success'] = "Employee updated successfully";
    } else {
        $_SESSION['error'] = "No changes made or employee not found";
    }

    $redirect_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '../index.php';
    header("Location: " . $redirect_url);
    exit();

} catch (Exception $e) {
    $_SESSION['error'] = "Error: " . $e->getMessage();
    $redirect_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '../index.php';
    header("Location: " . $redirect_url);
    exit();
}
?>