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
        // Check if an exit interview record exists for this employee
        $stmt = $con->prepare("SELECT interview_id FROM Exit_Interviews WHERE employee_id = :employee_id");
        $stmt->execute(['employee_id' => $employee_id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            // No exit interview record exists
            $response['error'] = 'You don\'t have any exit interview to submit. Contact your manager for any queries.';
            echo json_encode($response);
            exit();
        }

        // Fetch full exit interview details
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
                if ($field_name === 'assets_returned') {
                    if ($value === null || $value === '') {
                        $is_complete = false;
                        $missing_fields[] = $field_name;
                    }
                } else {
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
                $response['success'] = false; // Ensure success is false if incomplete
                $response['error'] = 'You need to submit your Exit Interview to view the details';
                $response['exit_interview'] = $exit_interview; // Still return the incomplete data for prefilling
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