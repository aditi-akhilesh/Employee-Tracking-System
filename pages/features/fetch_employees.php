<?php
// Disable display of errors to prevent HTML output
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

session_start();
require_once '../../auth/dbconnect.php';

try {
    $stmt = $con->prepare("
        SELECT 
            e.employee_id,
            u.first_name,
            u.last_name,
            u.email,
            u.role,
            e.department_id,
            e.emp_hire_date,
            e.salary,
            e.manager_id,
            e.emp_status
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id
        WHERE e.emp_status = 'Active'
    ");
    $stmt->execute();
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set the content type and output JSON response
    header('Content-Type: application/json');
    echo json_encode($employees);
    exit();

} catch (PDOException $e) {
    // Log the error for debugging
    error_log("Error in fetch_employees.php: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['error' => "Error fetching employees: " . $e->getMessage()]);
    exit();
}
?>