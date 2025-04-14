<?php
// fetch_employee_exit_interview.php
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
    if ($_POST['action'] === 'fetch_exit_interview') {
        $stmt = $con->prepare("
            SELECT 
                interview_id, employee_id, interview_date, last_working_date,
                resignation_type, primary_reason, overall_satisfaction_rating,
                knowledge_transfer_status, assets_returned, eligible_for_rehire
            FROM Exit_Interviews
            WHERE employee_id = :employee_id
        ");
        $stmt->execute(['employee_id' => $employee_id]);
        $exit_interview = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($exit_interview) {
            // Check if required fields are populated
            $required_fields = [
                'resignation_type' => $exit_interview['resignation_type'],
                'primary_reason' => $exit_interview['primary_reason'],
                'overall_satisfaction_rating' => $exit_interview['overall_satisfaction_rating'],
                'knowledge_transfer_status' => $exit_interview['knowledge_transfer_status'],
                'assets_returned' => $exit_interview['assets_returned']
            ];

            $is_complete = true;
            $missing_fields = [];

            foreach ($required_fields as $field_name => $value) {
                // For assets_returned, "0" is a valid value, so we check if it's null or empty string
                if ($field_name === 'assets_returned') {
                    if ($value === null || $value === '') {
                        $is_complete = false;
                        $missing_fields[] = $field_name;
                    }
                } else {
                    // For other fields, check if they are empty or null
                    if (empty($value) && $value !== '0') {
                        $is_complete = false;
                        $missing_fields[] = $field_name;
                    }
                }
            }

            if ($is_complete) {
                $response['success'] = true;
                $response['exit_interview'] = $exit_interview;
            } else {
                $response['error'] = 'Exit interview exists but is incomplete. Missing fields: ' . implode(', ', $missing_fields);
            }
        } else {
            $response['error'] = 'No exit interview details found for this employee.';
        }
    } else {
        $response['error'] = 'Invalid action';
    }
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>