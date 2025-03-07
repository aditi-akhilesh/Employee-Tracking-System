<?php
session_start();

// Updated roles: User, Manager, HR, Superadmin
$employees = [
    ['first_name' => 'Vaishali', 'last_name' => 'Kondoju', 'email' => 'vaishali@gmail.com', 'password' => password_hash('abc123', PASSWORD_DEFAULT), 'role' => 'HR'],
    ['first_name' => 'Amritha', 'last_name' => 'P', 'email' => 'amritha@gmail.com', 'password' => password_hash('abc123', PASSWORD_DEFAULT), 'role' => 'Superadmin'],
    ['first_name' => 'Aditi', 'last_name' => 'A', 'email' => 'aditi@gmail.com', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'Manager'],
    ['first_name' => 'Aditya', 'last_name' => 'S', 'email' => 'aditya@gmail.com', 'password' => password_hash('password', PASSWORD_DEFAULT), 'role' => 'User']
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $role = strtolower(trim(isset($_GET['role']) ? $_GET['role'] : ''));

    foreach ($employees as $employee) {
        if ($employee['email'] === $email &&
            password_verify($password, $employee['password']) &&
            strtolower($employee['role']) === $role) {
            $_SESSION['user_email'] = $employee['email'];
            $_SESSION['first_name'] = $employee['first_name'];
            $_SESSION['last_name'] = $employee['last_name'];
            $_SESSION['role'] = $employee['role'];

            $redirect = [
                'user' => '../pages/user_dashboard.php',
                'manager' => '../pages/manager_dashboard.php',
                'hr' => '../pages/hr_dashboard.php',
                'superadmin' => '../pages/superadmin_dashboard.php'
            ];

            if (isset($redirect[$role])) {
                header("Location: " . $redirect[$role]);
                exit();
            }
        }
    }

    $_SESSION['error'] = "Invalid email, password, or role mismatch.";
    header("Location: ../pages/login.php");
    exit();
} else {
    header("Location: ../pages/login.php");
    exit();
}
?>