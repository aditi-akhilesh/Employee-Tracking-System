<?php
session_start();

// Hardcoded employee credentials
$employees = [
    ['first_name' => 'Vaishali', 'last_name' => 'Kondoju', 'email' => 'kondojuvaishali98@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'Admin'],
    ['first_name' => 'Amritha', 'last_name' => 'P', 'email' => 'employee2@gmail.com', 'password' => password_hash('mypassword', PASSWORD_DEFAULT), 'role' => 'Superadmin'],
    ['first_name' => 'Aditi', 'last_name' => 'A', 'email' => 'employee3@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'Manager']
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    foreach ($employees as $employee) {
        if ($employee['email'] == $email && password_verify($password, $employee['password'])) {
            // Store session variables
            $_SESSION['user_email'] = $employee['email'];
            $_SESSION['first_name'] = $employee['first_name'];
            $_SESSION['last_name'] = $employee['last_name'];
            $_SESSION['role'] = $employee['role'];

            // Redirect based on role
            if ($employee['role'] == 'Admin') {
                header("Location: admin_dashboard.php");
            } elseif ($employee['role'] == 'Superadmin') {
                header("Location: superadmin_dashboard.php");
            }
              elseif ($employee['role'] == 'Manager') {
                header("Location: manager_dashboard.php");
}
            exit();
        }
    }

    // If authentication fails
    $_SESSION['error'] = "Invalid email or password. Please try again.";
    header("Location: admin_login.php");
    exit();
}
?>
