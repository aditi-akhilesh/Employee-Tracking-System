<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

// Enable error logging
ini_set('display_errors', 0); // Don’t display errors to the user
ini_set('log_errors', 1);     // Log errors
ini_set('error_log', '/path/to/your/error.log'); // Adjust path as needed

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $manager_id = $_SESSION['employee_id'] ?? null;
    if (!$manager_id) {
        throw new Exception('Manager ID not found in session');
    }

    if (isset($_POST['action']) && $_POST['action'] === 'delete') {
        $task_id = $_POST['task_id'] ?? null;
        if (!$task_id) {
            throw new Exception('Task ID is required for deletion');
        }

        // Delete from Assignment_Task
        $stmt = $con->prepare("DELETE FROM Assignment_Task WHERE task_id = :task_id");
        $stmt->execute(['task_id' => $task_id]);

        // Delete from Task
        $stmt = $con->prepare("DELETE FROM Task WHERE task_id = :task_id");
        $stmt->execute(['task_id' => $task_id]);

        $response['success'] = true;
    } else {
        $task_id = $_POST['task_id'] ?: null;
        $task_description = $_POST['task_description'] ?? null;
        $project_id = $_POST['project_id'] ?? null;
        $employee_id = $_POST['employee_id'] ?: null;
        $due_date = $_POST['due_date'] ?? null;
        $status = $_POST['status'] ?? null;

        // Validate required fields
        if (!$task_description || !$project_id || !$due_date || !$status) {
            throw new Exception('Missing required fields: ' . json_encode([
                'task_description' => $task_description,
                'project_id' => $project_id,
                'due_date' => $due_date,
                'status' => $status
            ]));
        }

        if ($task_id) {
            // Update Task
            $stmt = $con->prepare("
                UPDATE Task 
                SET task_description = :task_description, status = :status
                WHERE task_id = :task_id
            ");
            $stmt->execute([
                'task_description' => $task_description,
                'status' => $status,
                'task_id' => $task_id
            ]);

            // Update or Insert Assignment_Task
            $stmt = $con->prepare("
                INSERT INTO Assignment_Task (task_id, employee_id, due_date)
                VALUES (:task_id, :employee_id, :due_date)
                ON DUPLICATE KEY UPDATE employee_id = :employee_id, due_date = :due_date
            ");
            $stmt->execute([
                'task_id' => $task_id,
                'employee_id' => $employee_id,
                'due_date' => $due_date
            ]);
        } else {
            // Insert into Task
            $stmt = $con->prepare("
                INSERT INTO Task (task_description, status, project_id)
                VALUES (:task_description, :status, :project_id)
            ");
            $stmt->execute([
                'task_description' => $task_description,
                'status' => $status,
                'project_id' => $project_id
            ]);

            $task_id = $con->lastInsertId();

            if ($employee_id) {
                // Insert into Assignment_Task
                $stmt = $con->prepare("
                    INSERT INTO Assignment_Task (task_id, employee_id, due_date)
                    VALUES (:task_id, :employee_id, :due_date)
                ");
                $stmt->execute([
                    'task_id' => $task_id,
                    'employee_id' => $employee_id,
                    'due_date' => $due_date
                ]);
            }
        }

        $response['success'] = true;
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    error_log("Error in manage_tasks.php: " . $e->getMessage());
}

echo json_encode($response);
?>