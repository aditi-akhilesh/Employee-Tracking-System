<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'Unauthorized: User is not authenticated';
    echo json_encode($response);
    exit();
}

if ($_SESSION['role'] !== 'Manager') {
    $response['error'] = 'Unauthorized: Only Managers can delete exit interviews';
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['error'] = 'Invalid request method';
    echo json_encode($response);
    exit();
}

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$interview_id = isset($input['interview_id']) ? filter_var($input['interview_id'], FILTER_SANITIZE_NUMBER_INT) : null;

if (!$interview_id) {
    $response['error'] = 'Missing interview ID';
    echo json_encode($response);
    exit();
}

// Verify that the exit interview belongs to the manager
$interviewer_id = $_SESSION['employee_id'];
$stmt = $con->prepare("SELECT employee_id FROM Exit_Interviews WHERE interview_id = :interview_id AND interviewer_id = :interviewer_id");
$stmt->execute(['interview_id' => $interview_id, 'interviewer_id' => $interviewer_id]);
if ($stmt->rowCount() === 0) {
    $response['error'] = 'Exit interview not found or not authorized to delete';
    echo json_encode($response);
    exit();
}

try {
    $stmt = $con->prepare("DELETE FROM Exit_Interviews WHERE interview_id = :interview_id");
    $stmt->execute(['interview_id' => $interview_id]);

    $response['success'] = true;
    $response['message'] = 'Exit interview deleted successfully';
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit();
?>