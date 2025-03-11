<?php
session_start();
require_once '../includes/auth_check.php';
$page_title = "HR Dashboard";

include '../auth/dbconnect.php'; // Uses $con

// Fetch departments
try {
    $stmt = $con->query("SELECT department_id, department_name FROM Department");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
    $_SESSION['error'] = "Failed to fetch departments: " . $e->getMessage();
}

// Fetch projects
try {
    $stmt = $con->query("
        SELECT 
            project_id, project_name, start_date, expected_end_date, actual_end_date,
            client_name, client_contact_email, project_status, budget, actual_cost, department_id
        FROM Projects
    ");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $projects = [];
    $_SESSION['error'] = "Failed to fetch projects: " . $e->getMessage();
}
?>

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
    <style>
        .alert { padding: 10px; margin: 10px 0; border-radius: 5px; cursor: pointer; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_hr.php'; ?>
    <div class="content" id="content-area">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?> (HR)</h2>
        <p>Select an option from the menu on the left to get started.</p>
        <div id="profile-update-form"></div>
        <?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']); // Clear after displaying
        } elseif (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']); // Clear after displaying
        }
        ?>
    </div>
</div>
<script>
    const departments = <?php echo json_encode($departments); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    // Hide alert when clicking elsewhere
    document.addEventListener('click', function(event) {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (!alert.contains(event.target)) {
                alert.style.display = 'none';
            }
        });
    });
</script>
<script src="../assets/js/dashboard.js"></script>
</body>
</html>