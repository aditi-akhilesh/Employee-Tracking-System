<?php
ob_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include '../../auth/dbconnect.php';

try {
    if (!$con) {
        throw new Exception('Database connection failed');
    }

    $query = "
        SELECT 
            d.department_id, 
            d.department_name, 
            d.department_description
        FROM Department d
        GROUP BY d.department_id, d.department_name, d.department_description
        ORDER BY d.department_id
    ";
    $stmt = $con->query($query);

    if (!$stmt) {
        throw new Exception('Failed to execute query');
    }

    $departments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $departments[] = $row;
    }

    // Ensure UTF-8 encoding
    foreach ($departments as &$dept) {
        foreach ($dept as $key => $value) {
            if (is_string($value) && !mb_check_encoding($value, 'UTF-8')) {
                $dept[$key] = mb_convert_encoding($value, 'UTF-8', 'auto');
            }
        }
    }
    unset($dept);

    ob_end_clean();
    echo json_encode($departments, JSON_THROW_ON_ERROR);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_THROW_ON_ERROR);
}

exit;
?>