<?php
session_start();

// Hardcoded employee credentials
$employees = [
    ['email' => 'kondojuvaishali98@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT)],
    ['email' => 'employee2@example.com', 'password' => password_hash('mypassword', PASSWORD_DEFAULT)],
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    foreach ($employees as $employee) {
        if ($employee['email'] === $email && password_verify($password, $employee['password'])) {
            $_SESSION['user_email'] = $email;
            header("Location: user_dashboard.php");
            exit();
        }
    }

    $_SESSION['error'] = "Invalid email or password";
    header("Location: employee_login.php");
    exit();
}
