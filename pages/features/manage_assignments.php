<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $manager_id = $_SESSION['employee_id'];
    $project_id = $_POST['project_id'];
    $employee_id = $_POST['employee_id'];
    $role_in_project = $_POST['role_in_project'];

    // Check if employee is already assigned
    $stmt = $con->prepare("
        SELECT COUNT(*) FROM Assignment 
        WHERE project_id = :project_id AND employee_id = :employee_id
    ");
    $stmt->execute(['project_id' => $project_id, 'employee_id' => $employee_id]);
    if ($stmt->fetchColumn() > 0) {
        $response['error'] = 'Employee is already assigned to this project';
        echo json_encode($response);
        exit;
    } else {
        $response['success'] = "Employee Successfully Assigned to Project";
    }

    // Insert into Assignment
    $stmt = $con->prepare("
        INSERT INTO Assignment (employee_id, project_id, role_in_project, reporting_manager_id)
        VALUES (:employee_id, :project_id, :role_in_project, :reporting_manager_id)
    ");
    $stmt->execute([
        'employee_id' => $employee_id,
        'project_id' => $project_id,
        'role_in_project' => $role_in_project,
        'reporting_manager_id' => $manager_id
    ]);

    $response['success'] = true;
}

echo json_encode($response);
?>