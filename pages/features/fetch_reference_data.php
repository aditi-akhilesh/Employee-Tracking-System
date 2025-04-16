<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

$city_id = isset($_GET['city_id']) ? $_GET['city_id'] : null;

try {
    $response['cities'] = $con->query("SELECT city_id, city_name FROM City")->fetchAll(PDO::FETCH_ASSOC);
    $response['states'] = $con->query("SELECT state_id, state_name FROM State")->fetchAll(PDO::FETCH_ASSOC);
    if ($city_id === 'new' || $city_id === null || $city_id === '') {
        $response['zips'] = $con->query("SELECT zip_id, zip_code FROM Zip")->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $con->prepare("SELECT zip_id, zip_code FROM Zip WHERE city_id = ?");
        $stmt->execute([$city_id]);
        $response['zips'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("Fetched zips for city_id $city_id: " . json_encode($response['zips'])); // Debug log
    }
    $response['success'] = true;
} catch (PDOException $e) {
    http_response_code(500);
    $response['error'] = 'Database error: ' . $e->getMessage();
    error_log("Database error: " . $e->getMessage()); // Log error
}

echo json_encode($response);
exit();
?>