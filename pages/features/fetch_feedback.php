<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');

if ($_SESSION['role'] !== 'Manager') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

$manager_id = $_SESSION['employee_id'];

$stmt = $con->prepare("
    SELECT f.*, u.first_name, u.last_name 
    FROM Feedback f 
    JOIN Employees e ON f.employee_id = e.employee_id 
    JOIN Users u ON e.user_id = u.user_id 
    WHERE e.manager_id = :manager_id
    ORDER BY f.date_submitted DESC
");
$stmt->execute(['manager_id' => $manager_id]);
$feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($feedback);
?>