<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $employee_id = isset($_POST['employee_id']) ? (int)$_POST['employee_id'] : null;
    $action = $_POST['action'];
    $street_name = $_POST['street_name'] ?? '';
    $apt = $_POST['apt'] ?? '';
    $country = $_POST['country'] ?? 'USA';
    $zip_id = $_POST['zip_id'] ?? null;
    $new_zip = $_POST['new_zip'] ?? null;
    $new_city = $_POST['new_city'] ?? null;
    $new_state = $_POST['new_state'] ?? null;

    if (!$employee_id || !$street_name || !$country) {
        $response['error'] = 'Required fields are missing.';
        echo json_encode($response);
        exit;
    }

    try {
        $con->beginTransaction();

        // Fetch existing address_id if updating
        $address_id = null;
        if ($action === 'update') {
            $stmt = $con->prepare("SELECT address_id FROM Employee_Address WHERE employee_id = ? LIMIT 1");
            $stmt->execute([$employee_id]);
            $address = $stmt->fetch(PDO::FETCH_ASSOC);
            $address_id = $address ? $address['address_id'] : null;
            if (!$address_id) {
                $response['error'] = 'No existing address found for update.';
                echo json_encode($response);
                exit;
            }
        }

        // Handle new city, state, and zip if provided
        $final_zip_id = $zip_id;
        if ($new_zip || $new_city || $new_state) {
            // Insert new state if provided
            $state_id = null;
            if ($new_state) {
                $stmt = $con->prepare("INSERT INTO State (state_name) VALUES (?)");
                $stmt->execute([$new_state]);
                $state_id = $con->lastInsertId();
            }

            // Insert new city if provided
            $city_id = null;
            if ($new_city) {
                $stmt = $con->prepare("INSERT INTO City (city_name, state_id) VALUES (?, ?)");
                $stmt->execute([$new_city, $state_id ?? null]);
                $city_id = $con->lastInsertId();
            }

            // Insert new zip if provided
            if ($new_zip) {
                $stmt = $con->prepare("INSERT INTO Zip (zip_code, city_id) VALUES (?, ?)");
                $stmt->execute([$new_zip, $city_id ?? null]);
                $final_zip_id = $con->lastInsertId();
            }
        }

        // Insert or update address
        if ($action === 'insert' || !$address_id) {
            $stmt = $con->prepare("INSERT INTO Employee_Address (employee_id, street_name, apt, country, zip_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$employee_id, $street_name, $apt, $country, $final_zip_id ?? $zip_id]);
            $address_id = $con->lastInsertId();
        } else {
            $stmt = $con->prepare("UPDATE Employee_Address SET street_name = ?, apt = ?, country = ?, zip_id = ? WHERE address_id = ?");
            $stmt->execute([$street_name, $apt, $country, $final_zip_id ?? $zip_id, $address_id]);
        }

        $con->commit();
        $response['success'] = true;
    } catch (PDOException $e) {
        $con->rollBack();
        http_response_code(500);
        $response['error'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['error'] = 'Invalid request method.';
}

echo json_encode($response);
exit();
?>