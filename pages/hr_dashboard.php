<?php
require_once '../includes/auth_check.php';
$page_title = "HR Dashboard";
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
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_hr.php'; ?>
    <div class="content" id="content-area">
        <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?> (HR)</h2>
        <p>You are in HR Dashboard .Select an option from the menu on the left to get started.</p>
    </div>
</div>
<script src="../assets/js/dashboard.js"></script>
</body>
</html>