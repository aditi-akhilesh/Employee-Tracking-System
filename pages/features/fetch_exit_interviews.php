<?php
// Suppress error output in production; log errors instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

session_start();
require_once '../../auth/dbconnect.php';

try {
    // Debug: Log the database connection status
    if (!$con) {
        throw new Exception("Database connection failed");
    }
    error_log("Database connection successful in fetch_exit_interviews.php");

    // Check if the user is a manager
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Manager') {
        error_log("Unauthorized access attempt: " . print_r($_SESSION, true));
        throw new Exception("Unauthorized: User is not a manager");
    }

    $manager_id = $_SESSION['employee_id'] ?? null;
    if (!$manager_id) {
        error_log("Manager ID not found in session: " . print_r($_SESSION, true));
        throw new Exception("Manager ID not found in session");
    }

    $stmt = $con->prepare("
        SELECT ei.*, u.first_name, u.last_name 
        FROM Exit_Interviews ei 
        JOIN Employees e ON ei.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE ei.interviewer_id = :manager_id
        ORDER BY ei.interview_date DESC
    ");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $con->error);
    }
    error_log("SQL statement prepared successfully in fetch_exit_interviews.php");

    $stmt->execute(['manager_id' => $manager_id]);
    error_log("SQL statement executed successfully in fetch_exit_interviews.php");

    $exitInterviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($exitInterviews === false) {
        throw new Exception("Failed to fetch exit interviews: " . $stmt->error);
    }
    error_log("Raw exit interviews data before processing: " . print_r($exitInterviews, true));

    // Check for duplicate interview_id values
    $interview_ids = array_column($exitInterviews, 'interview_id');
    $duplicates = array_filter(array_count_values($interview_ids), function($count) {
        return $count > 1;
    });
    if (!empty($duplicates)) {
        error_log("Duplicate interview_id values found: " . print_r($duplicates, true));
    }

    // Process the exit interviews array
    foreach ($exitInterviews as &$ei) {
        $ei['interview_id'] = isset($ei['interview_id']) ? preg_replace('/[^0-9]/', '', (string)$ei['interview_id']) : '';
        $ei['employee_id'] = isset($ei['employee_id']) ? preg_replace('/[^0-9]/', '', (string)$ei['employee_id']) : '';
        $ei['interviewer_id'] = isset($ei['interviewer_id']) ? preg_replace('/[^0-9]/', '', (string)$ei['interviewer_id']) : '';
        $ei['first_name'] = isset($ei['first_name']) ? $ei['first_name'] : '';
        $ei['last_name'] = isset($ei['last_name']) ? $ei['last_name'] : '';
        $ei['interview_date'] = isset($ei['interview_date']) ? $ei['interview_date'] : null;
        $ei['last_working_date'] = isset($ei['last_working_date']) ? $ei['last_working_date'] : null;
        $ei['manager_rating'] = isset($ei['manager_rating']) && $ei['manager_rating'] !== null ? number_format((float)$ei['manager_rating'], 1, '.', '') : null;
        $ei['eligible_for_rehire'] = isset($ei['eligible_for_rehire']) ? (string)$ei['eligible_for_rehire'] : '0';
    }

    error_log("Processed exit interviews data: " . print_r($exitInterviews, true));

    header('Content-Type: application/json');
    header('Cache-Control: no-cache');
    echo json_encode($exitInterviews);
} catch (Exception $e) {
    error_log("Error in fetch_exit_interviews.php: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Error fetching exit interviews: ' . $e->getMessage()]);
}
?>