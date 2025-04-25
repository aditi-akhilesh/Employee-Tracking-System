<?php
ob_start();

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

    try {
        // Check if department has employees assigned
        $stmt = $con->prepare("SELECT COUNT(*) FROM Employees WHERE department_id = ?");
        if (!$stmt) {
            $response['message'] = 'Database error: Failed to prepare statement';
            echo json_encode($response);
            exit;
        }
        $stmt->execute([$department_id]);
        $count = $stmt->fetchColumn();
        $stmt->closeCursor();

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
        $stmt->execute([$department_id]);

        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = 'Department deleted successfully';
        } else {
            $response['message'] = 'No department found with the given ID';
        }
    } catch (Exception $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method';
}

ob_end_clean();
echo json_encode($response, JSON_THROW_ON_ERROR);
exit;
?>