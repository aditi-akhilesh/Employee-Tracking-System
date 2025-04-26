<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../auth/dbconnect.php';

// Set the current user in the session variable for database use
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit();
}

// Get filter parameters
$user_id = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';
$action_keyword = isset($_GET['action_keyword']) ? trim($_GET['action_keyword']) : '';
$start_date = isset($_GET['start_date']) ? trim($_GET['start_date']) : '';
$end_date = isset($_GET['end_date']) ? trim($_GET['end_date']) : '';

try {
    // Build the SQL query
    $query = "SELECT user_id, action, action_date FROM Audit_Log WHERE 1=1";
    $params = [];

    if ($user_id !== '') {
        $query .= " AND user_id = ?";
        $params[] = $user_id;
    }

    if ($action_keyword !== '') {
        $query .= " AND action LIKE ?";
        $params[] = '%' . $action_keyword . '%';
    }

    if ($start_date !== '' && $end_date !== '') {
        $query .= " AND action_date BETWEEN ? AND ?";
        $params[] = $start_date . ' 00:00:00'; // Start of the day
        $params[] = $end_date . ' 23:59:59';   // End of the day
    } elseif ($start_date !== '') {
        $query .= " AND action_date >= ?";
        $params[] = $start_date . ' 00:00:00';
    } elseif ($end_date !== '') {
        $query .= " AND action_date <= ?";
        $params[] = $end_date . ' 23:59:59';
    }

    $query .= " ORDER BY action_date DESC";

    $stmt = $con->prepare($query);
    $stmt->execute($params);
    $audit_logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $audit_logs]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

exit();
?>