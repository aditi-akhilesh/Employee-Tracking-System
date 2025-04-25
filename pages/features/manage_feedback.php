<?php
session_start();
require_once '../../auth/dbconnect.php'; // Uses $con

header('Content-Type: application/json');
$response = ['success' => false];
// tell MySQL who the current user is
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'Unauthorized: User is not authenticated';
    echo json_encode($response);
    exit();
}

if ($_SESSION['role'] !== 'Manager') {
    $response['error'] = 'Unauthorized: Only Managers can submit feedback';
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $employee_id = $_POST['employee_id'] ?? '';
    $rating = $_POST['rating'] ?? '';
    $feedback_type = $_POST['feedback_type'] ?? '';
    $feedback_text = $_POST['feedback_text'] ?? '';
    $reviewer_id = $_SESSION['employee_id']; // From authenticate.php
    $current_user_id = $_SESSION['user_id']; // The manager's user_id for audit logging

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

    // Insert into Audit_Log table for feedback submission
    //$action = "Submit Feedback";
    //$action_date = date('Y-m-d H:i:s');
    //$stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
    //$stmt_audit->bindParam(':user_id', $current_user_id);
    //$stmt_audit->bindParam(':action', $action);
    //$stmt_audit->bindParam(':action_date', $action_date);
    //try {
    //    $stmt_audit->execute();
    //} catch (PDOException $e) {
    //    error_log("Audit log insertion failed in " . __FILE__ . " on line " . __LINE__ . ": " . $e->getMessage());
    //}

    $response['success'] = true;
    $response['message'] = 'Feedback submitted successfully';
}
echo json_encode($response);
?>