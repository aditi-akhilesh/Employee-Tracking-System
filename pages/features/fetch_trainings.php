<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', 'php_errors.log');

ob_start();

session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized: User is not authenticated");
    }

    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'HR') {
        throw new Exception("Unauthorized: Only HR can view trainings");
    }

    $query = "
        SELECT training_id, training_name, training_date, end_date, certificate, department_id
        FROM Trainings
    ";
    $stmt = $con->prepare($query);
    $stmt->execute();
    $trainings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ob_end_clean();
    echo json_encode(['success' => true, 'trainings' => $trainings]);
} catch (Exception $e) {
    error_log("Error in fetch_trainings.php: " . $e->getMessage());
    ob_end_clean();
    echo json_encode(['error' => 'Error fetching trainings: ' . $e->getMessage()]);
}
?>