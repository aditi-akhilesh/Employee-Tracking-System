<?php
session_start();
require_once '../../auth/dbconnect.php'; // Uses $con

header('Content-Type: application/json');
$response = ['success' => false];

if ($_SESSION['role'] !== 'Manager') {
    $response['error'] = 'Unauthorized';
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $employee_id = $_POST['employee_id'] ?? '';
    $rating = $_POST['rating'] ?? '';
    $feedback_type = $_POST['feedback_type'] ?? '';
    $feedback_text = $_POST['feedback_text'] ?? '';
    $reviewer_id = $_SESSION['employee_id']; // From authenticate.php

    // Validation
    if (!$employee_id || !$rating || !$feedback_type || !$feedback_text) {
        $response['error'] = 'Missing required fields';
        echo json_encode($response);
        exit();
    }

    if ($rating < 1 || $rating > 5) {
        $response['error'] = 'Rating must be between 1 and 5';
        echo json_encode($response);
        exit();
    }

    // Verify employee is under this manager
    $stmt = $con->prepare("SELECT employee_id FROM Employees WHERE employee_id = :employee_id AND manager_id = :manager_id");
    $stmt->execute(['employee_id' => $employee_id, 'manager_id' => $reviewer_id]);
    if ($stmt->rowCount() === 0) {
        $response['error'] = 'Employee not assigned to this manager';
        echo json_encode($response);
        exit();
    }

    // Insert feedback
    $stmt = $con->prepare("INSERT INTO Feedback (employee_id, reviewer_id, rating, feedback_type, feedback_text, date_submitted) VALUES (:employee_id, :reviewer_id, :rating, :feedback_type, :feedback_text, NOW())");
    $stmt->execute([
        'employee_id' => $employee_id,
        'reviewer_id' => $reviewer_id,
        'rating' => $rating,
        'feedback_type' => $feedback_type,
        'feedback_text' => $feedback_text
    ]);

    $response['success'] = true;
    $response['message'] = 'Feedback submitted successfully';
}
echo json_encode($response);
?>