<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include '../../auth/dbconnect.php';

$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $department_id = isset($_POST['department_id']) ? trim($_POST['department_id']) : '';
    $department_name = isset($_POST['department_name']) ? trim($_POST['department_name']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    // Validate inputs
    if (empty($department_id) || empty($department_name)) {
        $response['message'] = 'Department ID and Name are required';
        echo json_encode($response);
        exit;
    }

    try {
        // Update the department
        $stmt = $con->prepare("UPDATE Department SET department_name = ?, department_description = ? WHERE department_id = ?");
        if (!$stmt) {
            $response['message'] = 'Database error: Failed to prepare statement';
            echo json_encode($response);
            exit;
        }
        $stmt->execute([$department_name, $description, $department_id]);

        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = 'Department updated successfully';
        } else {
            $response['message'] = 'No department found with the given ID';
        }
    } catch (Exception $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
exit;
?>