<?php
session_start();
require_once '../includes/auth_check.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Editable fields
    $phone = trim($_POST['phone'] ?? '');
    $street = trim($_POST['street'] ?? '');
    $apartment = trim($_POST['apartment'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $zip = trim($_POST['zip'] ?? '');
    $country = trim($_POST['country'] ?? '');

    // Simulate database update (replace with actual DB logic later)
    $updated_data = [
        'phone' => $phone,
        'street' => $street,
        'apartment' => $apartment,
        'city' => $city,
        'zip' => $zip,
        'country' => $country
    ];

    // For now, just store in session as a placeholder
    $_SESSION['user_details'] = $updated_data;

    // Redirect back to user dashboard with success message
    $_SESSION['success'] = "Profile updated successfully!";
    header("Location: ../pages/user_dashboard.php");
    exit();
} else {
    header("Location: ../pages/user_dashboard.php");
    exit();
}
?>