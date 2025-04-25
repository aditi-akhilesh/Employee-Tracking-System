<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

// tell MySQL who the current user is
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'Unauthorized: User is not authenticated';
    echo json_encode($response);
    exit();
}

if ($_SESSION['role'] !== 'Manager') {
    $response['error'] = 'Unauthorized: Only Managers can request exit interviews';
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['error'] = 'Invalid request method';
    echo json_encode($response);
    exit();
}

$employee_id = filter_var($_POST['employee_id'] ?? '', FILTER_SANITIZE_NUMBER_INT);
$last_working_date = $_POST['last_working_date'] ?? '';
$manager_rating = isset($_POST['manager_rating']) && $_POST['manager_rating'] !== '' ? floatval($_POST['manager_rating']) : null;
$eligible_for_rehire = isset($_POST['eligible_for_rehire']) ? intval($_POST['eligible_for_rehire']) : null;
$interviewer_id = $_SESSION['employee_id'];
$current_user_id = $_SESSION['user_id']; // The manager's user_id for audit logging

// Validation
if (!$employee_id || !$last_working_date || !isset($eligible_for_rehire)) {
    $response['error'] = 'Missing required fields';
    echo json_encode($response);
    exit();
}

$today = date('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $last_working_date) || $last_working_date < $today) {
    $response['error'] = 'Last working date must be today or in the future';
    echo json_encode($response);
    exit();
}

if ($manager_rating !== null && ($manager_rating < 1 || $manager_rating > 5)) {
    $response['error'] = 'Manager rating must be between 1 and 5';
    echo json_encode($response);
    exit();
}

if (!in_array($eligible_for_rehire, [0, 1], true)) {
    $response['error'] = 'Eligible for rehire must be 0 or 1';
    echo json_encode($response);
    exit();
}

// Verify employee is under this manager
$stmt = $con->prepare("SELECT employee_id FROM Employees WHERE employee_id = :employee_id AND manager_id = :manager_id");
$stmt->execute(['employee_id' => $employee_id, 'manager_id' => $interviewer_id]);
if ($stmt->rowCount() === 0) {
    $response['error'] = 'Employee not assigned to this manager';
    echo json_encode($response);
    exit();
}

try {
    $stmt = $con->prepare("
        INSERT INTO Exit_Interviews (
            employee_id, 
            interviewer_id, 
            interview_date, 
            last_working_date, 
            manager_rating, 
            eligible_for_rehire
        ) VALUES (
            :employee_id, 
            :interviewer_id, 
            :interview_date, 
            :last_working_date, 
            :manager_rating, 
            :eligible_for_rehire
        )
    ");
    $stmt->execute([
        'employee_id' => $employee_id,
        'interviewer_id' => $interviewer_id,
        'interview_date' => $today,
        'last_working_date' => $last_working_date,
        'manager_rating' => $manager_rating,
        'eligible_for_rehire' => $eligible_for_rehire
    ]);

    // Insert into Audit_Log table for exit interview request
    //$action = "Request Exit Interview";
    //$action_date = date('Y-m-d H:i:s');
    //$stmt_audit = $con->prepare("INSERT INTO Audit_Log (user_id, action, action_date) VALUES (:user_id, :action, :action_date)");
    //$stmt_audit->bindParam(':user_id', $current_user_id);
    //$stmt_audit->bindParam(':action', $action);
    //$stmt_audit->bindParam(':action_date', $action_date);
    //try {
     //  $stmt_audit->execute();
    //} catch (PDOException $e) {
    //   error_log("Audit log insertion failed in " . __FILE__ . " on line " . __LINE__ . ": " . $e->getMessage());
    //}

    $response['success'] = true;
    $response['message'] = 'Exit interview request submitted successfully';
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
exit();
?>