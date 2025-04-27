<?php
// submit_exit_interview.php
session_start();
require_once '../../auth/dbconnect.php';

// Tell MySQL who the current user is
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

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
      if ($_POST['action'] === 'submit_exit_interview') {
        $resignation_type = $_POST['resignation_type'] ?? '';
        $primary_reason = $_POST['primary_reason'] ?? '';
        $overall_satisfaction_rating = $_POST['overall_satisfaction_rating'] ?? '';
        $knowledge_transfer_status = $_POST['knowledge_transfer_status'] ?? '';
        $assets_returned = $_POST['assets_returned'] ?? '';

        // Log the received POST data for debugging
        error_log('Received POST data: ' . print_r($_POST, true));

        // Validate required fields with specific messages
        $errors = [];
        if (empty($resignation_type)) {
            $errors[] = 'Resignation Type is required.';
        }
        if (empty($primary_reason)) {
            $errors[] = 'Primary Reason for Leaving is required.';
        }
        if (empty($overall_satisfaction_rating)) {
            $errors[] = 'Overall Satisfaction Rating is required.';
        }
        if ($assets_returned === '') {
            $errors[] = 'Assets Returned is required.';
        }

        if (!empty($errors)) {
            $response['error'] = implode(' ', $errors);
            echo json_encode($response);
            exit();
        }

        // Check if an exit interview already exists for this employee
        $stmt = $con->prepare("SELECT interview_id FROM Exit_Interviews WHERE employee_id = :employee_id");
        $stmt->execute(['employee_id' => $employee_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Update existing record
            $stmt = $con->prepare("
                UPDATE Exit_Interviews
                SET 
                    resignation_type = :resignation_type,
                    primary_reason = :primary_reason,
                    overall_satisfaction_rating = :overall_satisfaction_rating,
                    knowledge_transfer_status = :knowledge_transfer_status,
                    assets_returned = :assets_returned
                WHERE employee_id = :employee_id
            ");
        } else {
            // Insert new record
            $stmt = $con->prepare("
                INSERT INTO Exit_Interviews (
                    employee_id, interview_date, resignation_type, primary_reason, 
                    overall_satisfaction_rating, knowledge_transfer_status, assets_returned
                )
                VALUES (
                    :employee_id, CURDATE(), :resignation_type, :primary_reason, 
                    :overall_satisfaction_rating, :knowledge_transfer_status, :assets_returned
                )
            ");
        }

        $success = $stmt->execute([
            'employee_id' => $employee_id,
            'resignation_type' => $resignation_type,
            'primary_reason' => $primary_reason,
            'overall_satisfaction_rating' => $overall_satisfaction_rating,
            'knowledge_transfer_status' => $knowledge_transfer_status,
            'assets_returned' => $assets_returned
        ]);

        if ($success) {
            $response['success'] = true;
        } else {
            $response['error'] = 'Failed to submit exit interview details.';
        }
    } else {
        $response['error'] = 'Invalid action';
    }
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>