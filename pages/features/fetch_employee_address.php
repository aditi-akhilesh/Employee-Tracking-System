<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

$employee_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : 0;

try {
    $stmt = $con->prepare("
        SELECT ea.*, z.zip_id, z.zip_code, c.city_id, c.city_name, s.state_id, s.state_name
        FROM Employee_Address ea
        LEFT JOIN Zip z ON ea.zip_id = z.zip_id
        LEFT JOIN City c ON z.city_id = c.city_id
        LEFT JOIN State s ON c.state_id = s.state_id
        WHERE ea.employee_id = ?
    ");
    $stmt->execute([$employee_id]);
    $address = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Fetched address for employee_id $employee_id: " . json_encode($address)); // Debug log
    echo json_encode(['success' => true, 'address' => $address]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error fetching address: ' . $e->getMessage()]);
    error_log("Error fetching address: " . $e->getMessage()); // Log error
}
exit();
?>