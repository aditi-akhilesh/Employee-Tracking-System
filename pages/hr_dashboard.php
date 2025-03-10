<?php
session_start();
require_once '../includes/auth_check.php';
$page_title = "HR Dashboard";

include '../auth/dbconnect.php'; // Uses $con

// Fetch departments (for the form)
try {
    $stmt = $con->query("SELECT department_id, department_name FROM Department");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents('departments_debug.log', "Departments fetched: " . print_r($departments, true) . "\n", FILE_APPEND);
} catch (PDOException $e) {
    $departments = [];
    file_put_contents('departments_debug.log', "Query failed: " . $e->getMessage() . "\n", FILE_APPEND);
    $_SESSION['error'] = "Failed to fetch departments: " . $e->getMessage();
}?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_hr.php'; ?>
    <div class="content" id="content-area">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?> (HR)</h2>
        <p>You are in HR Dashboard .Select an option from the menu on the left to get started.</p>
    <div id="profile-update-form"></div>
<?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        } elseif (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }
        ?>
    </div>
</div>
<script>
    const departments = <?php echo json_encode($departments); ?>;
</script>
<script src="../assets/js/dashboard.js"></script>
</body>
</html>