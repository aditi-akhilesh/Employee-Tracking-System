<?php
require_once '../includes/auth_check.php'; // Ensure this checks for Manager role
require_once '../auth/dbconnect.php'; // Uses $con

$page_title = "Manager Dashboard";

// Fetch employees assigned to this manager and their feedback
$manager_id = $_SESSION['employee_id']; // From authenticate.php
function fetchData($con, $manager_id) {
    $data = [];

    // Employees assigned to this manager
    $stmt = $con->prepare("
        SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
        FROM Employees e 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE e.manager_id = :manager_id AND e.emp_status != 'inactive' AND u.is_active = 1
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Employees for manager_id $manager_id: " . print_r($data['employees'], true));

    // Feedback given by this manager
    $stmt = $con->prepare("
        SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
               u.first_name, u.last_name 
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $data;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $data = fetchData($con, $manager_id);
        $response['success'] = true;
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

// Initial page load
$data = fetchData($con, $manager_id);
$employees = $data['employees'];
$feedback = $data['feedback'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_manager.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?> (Manager)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="profile-update-form" style="display: none;"></div>
        <?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        }
        if (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }
        ?>
    </div>
</div>
<script>
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const userName = "<?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?>";
    const managerId = <?php echo json_encode($manager_id); ?>;
// Refresh data on page load
    document.addEventListener('DOMContentLoaded', function() {
        refreshData();
    });
</script>
<script src="../assets/js/dashboard.js"></script>
<script src="../assets/js/manager_dashboard.js"></script>
</body>
</html>