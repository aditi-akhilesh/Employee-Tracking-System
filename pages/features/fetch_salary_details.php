<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

$response = ['success' => false, 'error' => ''];

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'Not authenticated';
    echo json_encode($response);
    exit();
}

$user_id = $_SESSION['user_id'];

try {
    // Prepare the query to fetch salary details from the Employees table
    $stmt = $con->prepare("
        SELECT e.employee_id, e.salary, e.emp_job_title, e.emp_hire_date, e.department_id
        FROM Employees e
        WHERE e.user_id = :user_id
    ");
    
    // Execute the query with the user_id parameter
    $stmt->execute(['user_id' => $user_id]);
    
    // Fetch the salary details
    $salary_details = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($salary_details) {
        $response['success'] = true;
        $response['salary_details'] = $salary_details;
    } else {
        $response['error'] = 'No salary details found for this user.';
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>