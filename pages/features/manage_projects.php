<?php
session_start();
include '../../auth/dbconnect.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'HR') {
    header("Location: ../login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'add') {
            $project_name = trim($_POST['project_name']);
            $start_date = $_POST['start_date'];
            $expected_end_date = $_POST['expected_end_date'];
            $client_name = trim($_POST['client_name']);
            $client_contact_email = trim($_POST['client_contact_email']);
            $project_status = $_POST['project_status'];
            $budget = floatval($_POST['budget']);
            $department_id = $_POST['department_id'];

            // Check if project_name already exists
            $stmt = $con->prepare("SELECT COUNT(*) FROM Projects WHERE project_name = :project_name");
            $stmt->execute(['project_name' => $project_name]);
            if ($stmt->fetchColumn() > 0) {
                $_SESSION['error'] = "Project name '$project_name' already exists.";
            } else {
                $stmt = $con->prepare("
                    INSERT INTO Projects (
                        project_name, start_date, expected_end_date, client_name, 
                        client_contact_email, project_status, budget, department_id
                    ) VALUES (
                        :project_name, :start_date, :expected_end_date, :client_name, 
                        :client_contact_email, :project_status, :budget, :department_id
                    )
                ");
                $stmt->execute([
                    'project_name' => $project_name,
                    'start_date' => $start_date,
                    'expected_end_date' => $expected_end_date,
                    'client_name' => $client_name,
                    'client_contact_email' => $client_contact_email,
                    'project_status' => $project_status,
                    'budget' => $budget,
                    'department_id' => $department_id
                ]);
                $_SESSION['success'] = "Project '$project_name' added successfully!";
            }
        } elseif ($action === 'edit') {
            $project_id = intval($_POST['project_id']);
            $project_name = trim($_POST['project_name']);
            $start_date = $_POST['start_date'];
            $expected_end_date = $_POST['expected_end_date'];
            $actual_end_date = $_POST['actual_end_date'] ?: null;
            $client_name = trim($_POST['client_name']);
            $client_contact_email = trim($_POST['client_contact_email']);
            $project_status = $_POST['project_status'];
            $budget = floatval($_POST['budget']);
            $actual_cost = $_POST['actual_cost'] ? floatval($_POST['actual_cost']) : null;
            $department_id = $_POST['department_id'];

            // Check for duplicate project_name (excluding current project)
            $stmt = $con->prepare("SELECT COUNT(*) FROM Projects WHERE project_name = :project_name AND project_id != :project_id");
            $stmt->execute(['project_name' => $project_name, 'project_id' => $project_id]);
            if ($stmt->fetchColumn() > 0) {
                $_SESSION['error'] = "Project name '$project_name' is already taken by another project.";
            } else {
                $stmt = $con->prepare("
                    UPDATE Projects
                    SET project_name = :project_name,
                        start_date = :start_date,
                        expected_end_date = :expected_end_date,
                        actual_end_date = :actual_end_date,
                        client_name = :client_name,
                        client_contact_email = :client_contact_email,
                        project_status = :project_status,
                        budget = :budget,
                        actual_cost = :actual_cost,
                        department_id = :department_id
                    WHERE project_id = :project_id
                ");
                $stmt->execute([
                    'project_name' => $project_name,
                    'start_date' => $start_date,
                    'expected_end_date' => $expected_end_date,
                    'actual_end_date' => $actual_end_date,
                    'client_name' => $client_name,
                    'client_contact_email' => $client_contact_email,
                    'project_status' => $project_status,
                    'budget' => $budget,
                    'actual_cost' => $actual_cost,
                    'department_id' => $department_id,
                    'project_id' => $project_id
                ]);
                $_SESSION['success'] = "Project '$project_name' updated successfully!";
            }
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
    }
}

header("Location: ../hr_dashboard.php");
exit();
?>