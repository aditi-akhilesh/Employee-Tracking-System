<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $manager_id = $_SESSION['employee_id'] ?? null;
    if (!$manager_id) {
        throw new Exception('Unauthorized: Manager ID not found');
    }

    // Use PDO instead of $con (assuming dbconnect.php sets up PDO as $pdo)
    $pdo = $con; // Adjust if dbconnect.php uses a different variable name

    if (isset($_POST['action']) && $_POST['action'] === 'delete') {
        $task_id = $_POST['task_id'] ?? null;
        if (!$task_id || !is_numeric($task_id)) {
            throw new Exception('Invalid task ID');
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("DELETE FROM Assignment_Task WHERE task_id = ?");
            $stmt->execute([$task_id]);

            $stmt = $pdo->prepare("DELETE FROM Task WHERE task_id = ?");
            $stmt->execute([$task_id]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('Task not found');
            }

            $pdo->commit();
            $response['success'] = true;
        } catch (Exception $e) {
            $pdo->rollBack();
            throw new Exception('Failed to delete task: ' . $e->getMessage());
        }
    } else {
        $task_id = $_POST['task_id'] ?: null;
        $project_id = $_POST['project_id'] ?? null;
        $task_description = $_POST['task_description'] ?? null;
        $employee_id = $_POST['employee_id'] ?: null;
        $due_date = $_POST['due_date'] ?? null;
        $status = $_POST['status'] ?? null;

        // Validate required fields
        if (!$project_id || !$task_description || !$due_date || !$status) {
            throw new Exception('Missing required fields');
        }
        if (!is_numeric($project_id)) {
            throw new Exception('Invalid project ID');
        }
        if (strtotime($due_date) < strtotime(date('Y-m-d'))) {
            throw new Exception('Due date cannot be in the past');
        }
        if (!in_array($status, ['To Do', 'In Progress', 'Done'])) {
            throw new Exception('Invalid status');
        }

        $pdo->beginTransaction();
        try {
            if ($task_id) {
                // Update Task
                $stmt = $pdo->prepare("
                    UPDATE Task 
                    SET task_description = ?, status = ?
                    WHERE task_id = ?
                ");
                $stmt->execute([$task_description, $status, $task_id]);

                if ($stmt->rowCount() === 0) {
                    throw new Exception('Task not found');
                }

                // Update Assignment_Task
                $stmt = $pdo->prepare("DELETE FROM Assignment_Task WHERE task_id = ?");
                $stmt->execute([$task_id]);

                if ($employee_id && is_numeric($employee_id)) {
                    $stmt = $pdo->prepare("
                        INSERT INTO Assignment_Task (task_id, employee_id, due_date)
                        VALUES (?, ?, ?)
                    ");
                    $stmt->execute([$task_id, $employee_id, $due_date]);
                }
            } else {
                // Insert into Task
                $stmt = $pdo->prepare("
                    INSERT INTO Task (task_description, status, project_id)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$task_description, $status, $project_id]);
                $task_id = $pdo->lastInsertId();

                // Insert into Assignment_Task if employee_id provided
                if ($employee_id && is_numeric($employee_id)) {
                    $stmt = $pdo->prepare("
                        INSERT INTO Assignment_Task (task_id, employee_id, due_date)
                        VALUES (?, ?, ?)
                    ");
                    $stmt->execute([$task_id, $employee_id, $due_date]);
                }
            }

            $pdo->commit();
            $response['success'] = true;
        } catch (Exception $e) {
            $pdo->rollBack();
            throw new Exception('Failed to save task: ' . $e->getMessage());
        }
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    error_log("Error in manage_tasks.php: " . $e->getMessage());
}

echo json_encode($response);
?>