<?php
session_start();

// Hardcoded employee credentials
$employees = [
    ['email' => 'kondojuvaishali98@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT)],
    ['email' => 'abc@gmail.com', 'password' => password_hash('1234', PASSWORD_DEFAULT)],
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    foreach ($employees as $employee) {
        if ($employee['email'] === $email && password_verify($password, $employee['password'])) {
            $_SESSION['user_email'] = $email;
            header("Location: admin_dashboard.php");
            exit();
        }
    }

    $_SESSION['error'] = "Invalid email or password";
    header("Location: admin_login.php");
    exit();
}
