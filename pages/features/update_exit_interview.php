<?php
// Suppress error output in production; log errors instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Manager') {
        throw new Exception('Unauthorized: User is not a manager');
    }

    $interview_id = $_POST['interview_id'] ?? null;
    $last_working_date = $_POST['last_working_date'] ?? null;
    $manager_rating = $_POST['manager_rating'] ?? null;
    $eligible_for_rehire = $_POST['eligible_for_rehire'] ?? null;

    if (!$interview_id || !$last_working_date || !isset($eligible_for_rehire)) {
        throw new Exception('Missing required fields');
    }

    // Validate eligible_for_rehire
    if (!in_array($eligible_for_rehire, ['0', '1'])) {
        throw new Exception('Eligible for rehire must be 0 or 1');
    }

    // Validate manager_rating if provided
    if ($manager_rating !== '' && ($manager_rating < 1 || $manager_rating > 5)) {
        throw new Exception('Manager rating must be between 1 and 5');
    }

    $stmt = $con->prepare("
        UPDATE Exit_Interviews 
        SET last_working_date = :last_working_date, 
            manager_rating = :manager_rating, 
            eligible_for_rehire = :eligible_for_rehire 
        WHERE interview_id = :interview_id
    ");
    $stmt->execute([
        'last_working_date' => $last_working_date,
        'manager_rating' => $manager_rating ?: null,
        'eligible_for_rehire' => $eligible_for_rehire,
        'interview_id' => $interview_id
    ]);

    echo json_encode(['success' => true, 'message' => 'Exit interview updated successfully']);
} catch (Exception $e) {
    error_log("Error in update_exit_interview.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>