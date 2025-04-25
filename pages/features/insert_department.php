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
        // Check if department_id already exists
        $stmt = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = ?");
        if (!$stmt) {
            $response['message'] = 'Database error: Failed to prepare statement';
            echo json_encode($response);
            exit;
        }
        $stmt->execute([$department_id]);
        $count = $stmt->fetchColumn();
        $stmt->closeCursor();

        if ($count > 0) {
            $response['message'] = 'Department ID already exists';
            echo json_encode($response);
            exit;
        }

        // Insert the new department
        $stmt = $con->prepare("INSERT INTO Department (department_id, department_name, department_description) VALUES (?, ?, ?)");
        if (!$stmt) {
            $response['message'] = 'Database error: Failed to prepare statement';
            echo json_encode($response);
            exit;
        }
        $stmt->execute([$department_id, $department_name, $description]);

        $response['success'] = true;
        $response['message'] = 'Department added successfully';
    } catch (Exception $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
exit;
?>