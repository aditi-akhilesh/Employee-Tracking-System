<?php
// fetch_employee_feedback.php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

$response = ['success' => false, 'error' => ''];

// Check if the user is authenticated
if (!isset($_SESSION['user_id']) || !isset($_SESSION['employee_id'])) {
    $response['error'] = 'Not authenticated';
    echo json_encode($response);
    exit();
}

$employee_id = $_SESSION['employee_id'];

try {
    if ($_POST['action'] === 'fetch_feedback') {
        $stmt = $con->prepare("
            SELECT 
                feedback_id, employee_id, reviewer_id, rating, feedback_type, feedback_text, date_submitted
            FROM Feedback
            WHERE employee_id = :employee_id
            ORDER BY date_submitted DESC
        ");
        $stmt->execute(['employee_id' => $employee_id]);
        $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($feedback) {
            $response['success'] = true;
            $response['feedback'] = $feedback;
        } else {
            $response['error'] = 'No feedback found for this employee.';
        }
    } else {
        $response['error'] = 'Invalid action';
    }
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>