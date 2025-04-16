<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

try {
    $stmt = $con->prepare("
        SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date, 
               et.completion_status, u.first_name, u.last_name 
        FROM Employee_Training et
        JOIN Employees e ON et.employee_id = e.employee_id JOIN Users u ON e.user_id = u.user_id

    ");
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ensure result is an array, even if empty
    if (!$result) {
        $result = [];
    }

    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error fetching employee trainings: ' . $e->getMessage()]);
}
exit();
?>