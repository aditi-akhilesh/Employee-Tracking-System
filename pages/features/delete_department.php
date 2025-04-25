<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include '../../auth/dbconnect.php';

$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $department_id = isset($_POST['department_id']) ? trim($_POST['department_id']) : '';

    // Validate input
    if (empty($department_id)) {
        $response['message'] = 'Department ID is required';
        echo json_encode($response);
        exit;
    }

    // Check if department has employees assigned
    $stmt = $con->prepare("SELECT COUNT(*) FROM employees WHERE department_id = ?");
    if (!$stmt) {
        $response['message'] = 'Database error: Failed to prepare statement';
        echo json_encode($response);
        exit;
    }
    $stmt->bind_param("s", $department_id);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    if ($count > 0) {
        $response['message'] = "Cannot delete department: It has $count employee(s) assigned";
        echo json_encode($response);
        exit;
    }

    // Delete the department
    $stmt = $con->prepare("DELETE FROM Department WHERE department_id = ?");
    if (!$stmt) {
        $response['message'] = 'Database error: Failed to prepare statement';
        echo json_encode($response);
        exit;
    }
    $stmt->bind_param("s", $department_id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Department deleted successfully';
        } else {
            $response['message'] = 'No department found with the given ID';
        }
    } else {
        $response['message'] = 'Error deleting department: ' . $stmt->error;
    }

    $stmt->close();
    $con->close();
} else {
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
exit;
?>