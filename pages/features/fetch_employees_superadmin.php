<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

$response = ['success' => false, 'error' => ''];

try {
    // Fetch data from the Employee_Details_View
    $stmt = $con->prepare("
        SELECT 
            employee_id,
            first_name,
            last_name,
            email,
            role,
            department_name,
            emp_hire_date,
            salary,
            training_count,
            completed_trainings,
            task_count,
            leave_count,
            avg_feedback_rating
        FROM Employee_Details_View where role != 'Super Admin'
    ");
    $stmt->execute();
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($employees) {
        $response['success'] = true;
        $response['employees'] = $employees;
    } else {
        $response['error'] = 'No employee data found.';
    }
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit();
?>