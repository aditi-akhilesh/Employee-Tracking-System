<?php
// Disable display of errors to prevent HTML output
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

ob_start();

session_start();
require_once '../../auth/dbconnect.php';

function safeLog($message) {
    $logFile = __DIR__ . '/update_employee_superadmin_debug.log';
    $timestamp = date('Y-m-d H:i:s');
    $formattedMessage = "[$timestamp] $message\n";
    if (file_put_contents($logFile, $formattedMessage, FILE_APPEND) === false) {
        error_log("Failed to write to $logFile: $message");
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized: User is not authenticated");
    }

    // Check if the user has the SuperAdmin role
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Super Admin') {
        throw new Exception("Unauthorized: Only Super Admins can update employee details");
    }

    $current_user_id = $_SESSION['user_id'];
    $current_user_role = $_SESSION['role'];

    safeLog("Starting update_employee_superadmin.php for user ID: $current_user_id with role: $current_user_role");
    safeLog("Received POST data: " . json_encode($_POST));

    $employee_id = filter_var($_POST['employee_id'] ?? '', FILTER_SANITIZE_NUMBER_INT);
    $first_name = htmlspecialchars(trim($_POST['first_name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $last_name = htmlspecialchars(trim($_POST['last_name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $role = htmlspecialchars(trim($_POST['role'] ?? ''), ENT_QUOTES, 'UTF-8');
    $department_id = htmlspecialchars(trim($_POST['department_id'] ?? ''), ENT_QUOTES, 'UTF-8');
    $emp_hire_date = htmlspecialchars(trim($_POST['emp_hire_date'] ?? ''), ENT_QUOTES, 'UTF-8');
    $salary = filter_var($_POST['salary'] ?? '', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $manager_id = isset($_POST['manager_id']) && $_POST['manager_id'] !== '' ? htmlspecialchars(trim($_POST['manager_id']), ENT_QUOTES, 'UTF-8') : '';
    $is_manager = filter_var($_POST['is_manager'] ?? '0', FILTER_SANITIZE_NUMBER_INT);

    if (empty($employee_id) || empty($first_name) || empty($last_name) || empty($email) || empty($role) || empty($emp_hire_date)) {
        throw new Exception("Required fields are missing");
    }

    // Fetch the employee being updated
    $stmt = $con->prepare("SELECT e.*, u.first_name, u.last_name, u.email, u.role 
                           FROM Employees e 
                           JOIN Users u ON e.user_id = u.user_id 
                           WHERE e.employee_id = :employee_id");
    $stmt->execute([':employee_id' => $employee_id]);
    $currentEmployee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentEmployee) {
        throw new Exception("Employee not found.");
    }

    $department_id = $department_id ?: $currentEmployee['department_id'];

    $currentValues = [
        'first_name' => trim((string)$currentEmployee['first_name']),
        'last_name' => trim((string)$currentEmployee['last_name']),
        'email' => trim((string)$currentEmployee['email']),
        'role' => trim((string)$currentEmployee['role']),
        'department_id' => trim((string)$currentEmployee['department_id']),
        'emp_hire_date' => trim((string)$currentEmployee['emp_hire_date']),
        'salary' => number_format((float)$currentEmployee['salary'], 2, '.', ''),
        'manager_id' => $currentEmployee['manager_id'] ? trim((string)$currentEmployee['manager_id']) : '',
        'is_manager' => trim((string)$currentEmployee['is_manager'])
    ];

    $submittedValues = [
        'first_name' => trim($first_name),
        'last_name' => trim($last_name),
        'email' => trim($email),
        'role' => trim($role),
        'department_id' => trim($department_id),
        'emp_hire_date' => trim($emp_hire_date),
        'salary' => number_format((float)$salary, 2, '.', ''),
        'manager_id' => trim($manager_id),
        'is_manager' => trim((string)$is_manager)
    ];

    safeLog("Current values: " . json_encode($currentValues));
    safeLog("Submitted values: " . json_encode($submittedValues));

    $hasChanges = false;
    foreach ($currentValues as $key => $currentValue) {
        $submittedValue = $submittedValues[$key];
        if ($currentValue !== $submittedValue) {
            safeLog("Change detected in $key: '$currentValue' vs '$submittedValue'");
            $hasChanges = true;
            break;
        }
    }

    if (!$hasChanges) {
        safeLog("No changes detected");
        ob_end_clean();
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'No changes detected']);
        exit();
    }

    // Check if changing from Manager to User and has subordinates
    if ($currentValues['role'] === 'Manager' && $submittedValues['role'] === 'User') {
        $checkSubordinates = $con->prepare("SELECT COUNT(*) FROM Employees WHERE manager_id = :manager_id AND employee_id != :employee_id");
        $checkSubordinates->execute([':manager_id' => $employee_id, ':employee_id' => $employee_id]);
        $subordinateCount = $checkSubordinates->fetchColumn();
        if ($subordinateCount > 0) {
            throw new Exception("Cannot change role to User: This manager has $subordinateCount employee(s) assigned.");
        }
    }

    $checkDept = $con->prepare("SELECT COUNT(*) FROM Department WHERE department_id = :department_id");
    $checkDept->execute([':department_id' => $department_id]);
    if ($checkDept->fetchColumn() == 0) {
        throw new Exception("Invalid department ID: $department_id does not exist");
    }

    if ($role === 'User' && $manager_id !== '') {
        $checkManager = $con->prepare("SELECT COUNT(*) FROM Employees e JOIN Users u ON e.user_id = u.user_id WHERE e.employee_id = :manager_id AND u.role = 'Manager'");
        $checkManager->execute([':manager_id' => $manager_id]);
        if ($checkManager->fetchColumn() == 0) {
            throw new Exception("Invalid manager ID: $manager_id does not exist or is not a Manager");
        }

        $stmtManagerDept = $con->prepare("SELECT department_id FROM Employees WHERE employee_id = :manager_id");
        $stmtManagerDept->execute([':manager_id' => $manager_id]);
        $manager_department_id = $stmtManagerDept->fetchColumn();
        if ($manager_department_id !== $department_id) {
            throw new Exception("Department ID does not match the selected manager's department.");
        }
    }

    $con->beginTransaction();

    $user_id = $currentEmployee['user_id'];

    $sqlUser = "UPDATE Users SET first_name = :first_name, last_name = :last_name, email = :email, role = :role WHERE user_id = :user_id";
    $stmtUser = $con->prepare($sqlUser);
    $stmtUser->execute([
        ':first_name' => $first_name,
        ':last_name' => $last_name,
        ':email' => $email,
        ':role' => $role,
        ':user_id' => $user_id
    ]);

    $sqlEmployee = "UPDATE Employees SET department_id = :department_id, emp_hire_date = :emp_hire_date, salary = :salary, manager_id = :manager_id, is_manager = :is_manager WHERE employee_id = :employee_id";
    $stmtEmployee = $con->prepare($sqlEmployee);
    $stmtEmployee->execute([
        ':department_id' => $department_id,
        ':emp_hire_date' => $emp_hire_date,
        ':salary' => $salary,
        ':manager_id' => $manager_id === '' ? null : $manager_id,
        ':is_manager' => $is_manager,
        ':employee_id' => $employee_id
    ]);

    $con->commit();

    // Insert into Audit_Log table for employee update with error handling
    $action = "Update Employee (SuperAdmin)";
    $action_date = date('Y-m-d H:i:s');
    $stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
    $stmt_audit->bindParam(':user_id', $current_user_id);
    $stmt_audit->bindParam(':action', $action);
    $stmt_audit->bindParam(':action_date', $action_date);
    try {
        $stmt_audit->execute();
    } catch (PDOException $e) {
        safeLog("Audit log insertion failed in " . __FILE__ . " on line " . __LINE__ . ": " . $e->getMessage());
    }

    safeLog("Employee updated successfully by SuperAdmin");

    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
    exit();

} catch (Exception $e) {
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    safeLog("Error: " . $e->getMessage());
    ob_end_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Error: " . $e->getMessage()]);
    exit();
}
?>