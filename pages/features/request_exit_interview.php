<?php
session_start();
require_once '../../auth/dbconnect.php';

header('Content-Type: application/json');
$response = ['success' => false];

// Tell MySQL who the current user is
$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'Unauthorized: User is not authenticated';
    $response['debug'] = 'Session user_id not set';
    echo json_encode($response);
    exit();
}

if ($_SESSION['role'] !== 'Manager') {
    $response['error'] = 'Unauthorized: Only Managers can request exit interviews';
    $response['debug'] = 'Role: ' . ($_SESSION['role'] ?? 'not set');
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['error'] = 'Invalid request method';
    $response['debug'] = 'Method: ' . $_SERVER['REQUEST_METHOD'];
    echo json_encode($response);
    exit();
}

$employee_id = filter_var($_POST['employee_id'] ?? '', FILTER_SANITIZE_NUMBER_INT);
$last_working_date = $_POST['last_working_date'] ?? '';
$manager_rating = isset($_POST['manager_rating']) && $_POST['manager_rating'] !== '' ? floatval($_POST['manager_rating']) : null;
$eligible_for_rehire = isset($_POST['eligible_for_rehire']) ? intval($_POST['eligible_for_rehire']) : null;
$interviewer_id = $_SESSION['employee_id'];
$current_user_id = $_SESSION['user_id'];

// Debug input data
$response['debug']['post_data'] = $_POST;
$response['debug']['processed_data'] = [
    'employee_id' => $employee_id,
    'last_working_date' => $last_working_date,
    'manager_rating' => $manager_rating,
    'eligible_for_rehire' => $eligible_for_rehire,
    'interviewer_id' => $interviewer_id,
    'current_user_id' => $current_user_id
];

// Validation
if (!$employee_id || !$last_working_date || !isset($eligible_for_rehire)) {
    $response['error'] = 'Missing required fields';
    echo json_encode($response);
    exit();
}

$today = date('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $last_working_date) || $last_working_date < $today) {
    $response['error'] = 'Last working date must be today or in the future';
    $response['debug']['date_validation'] = [
        'last_working_date' => $last_working_date,
        'today' => $today
    ];
    echo json_encode($response);
    exit();
}

if ($manager_rating !== null && ($manager_rating < 1 || $manager_rating > 5)) {
    $response['error'] = 'Manager rating must be between 1 and 5';
    $response['debug']['manager_rating'] = $manager_rating;
    echo json_encode($response);
    exit();
}

if (!in_array($eligible_for_rehire, [0, 1], true)) {
    $response['error'] = 'Eligible for rehire must be 0 or 1';
    $response['debug']['eligible_for_rehire'] = $eligible_for_rehire;
    echo json_encode($response);
    exit();
}

// Verify employee is under this manager
$stmt = $con->prepare("SELECT employee_id FROM Employees WHERE employee_id = :employee_id AND manager_id = :manager_id");
$stmt->execute(['employee_id' => $employee_id, 'manager_id' => $interviewer_id]);
if ($stmt->rowCount() === 0) {
    $response['error'] = 'Employee not assigned to this manager';
    $response['debug']['manager_assignment'] = [
        'employee_id' => $employee_id,
        'manager_id' => $interviewer_id,
        'row_count' => $stmt->rowCount()
    ];
    echo json_encode($response);
    exit();
}

// Check if an exit interview already exists for this employee
$stmt = $con->prepare("SELECT COUNT(*) FROM Exit_Interviews WHERE employee_id = :employee_id");
$stmt->execute(['employee_id' => $employee_id]);
$exitInterviewCount = $stmt->fetchColumn();
$response['debug']['exit_interview_count'] = $exitInterviewCount;

if ($exitInterviewCount > 0) {
    $response['error'] = 'Exit interview already requested for this employee';
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

    $response['success'] = true;
    $response['message'] = 'Exit interview request submitted successfully';
} catch (Exception $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
    $response['debug']['sql_error'] = $e->getMessage();
    echo json_encode($response);
    exit();
}

echo json_encode($response);
exit();
?>