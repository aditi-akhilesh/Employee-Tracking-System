<?php
session_start();

// Hardcoded employee credentials
$employees = [
    ['first_name' => 'Vaishali', 'last_name' => 'Kondoju', 'email' => 'kondojuvaishali98@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT)],
    ['first_name' => 'Amritha', 'last_name' => 'P', 'email' => 'employee2@example.com', 'password' => password_hash('mypassword', PASSWORD_DEFAULT)],
    ['first_name' => 'Aditya', 'last_name' => 'S', 'email' => 'employee3@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT)],
    ['first_name' => 'Aditi', 'last_name' => 'A', 'email' => 'employee4@example.com', 'password' => password_hash('mypassword', PASSWORD_DEFAULT)]
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $authenticated = false;

    foreach ($employees as $employee) {
        if ($employee['email'] === $email && password_verify($password, $employee['password'])) {
            $authenticated = true;
            $_SESSION['user_email'] = $employee['email'];
            $_SESSION['first_name'] = $employee['first_name'];
            $_SESSION['last_name'] = $employee['last_name'];
            header("Location: user_dashboard.php");
            exit();
        }
    }

    if (!$authenticated) {
        $_SESSION['error'] = "Invalid email or password. Please try again.";
        header("Location: employee_login.php");
        exit();
    }
}
?>
