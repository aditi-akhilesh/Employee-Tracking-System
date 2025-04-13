<?php
// update_user_details.php

// Suppress error output in production; log errors instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Start output buffering to capture any unintended output
ob_start();

session_start();
require_once '../../auth/dbconnect.php';


header('Content-Type: application/json');

try {
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized: User is not authenticated");
    }

    $user_id = $_SESSION['user_id'];
    $email = $_POST['email'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $dob = $_POST['dob'] ?? '';
    $emergency_contacts = $_POST['emergency_contacts'] ?? [];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Validate phone number
    if (!preg_match('/^[0-9]{10}$/', $phone_number)) {
        throw new Exception("Phone number must be exactly 10 digits");
    }

    // Validate dob (YYYY-MM-DD format)
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
        throw new Exception("Invalid date of birth format. Use YYYY-MM-DD");
    }

    // Validate emergency contacts
    if (!is_array($emergency_contacts)) {
        throw new Exception("Emergency contacts must be an array");
    }
    foreach ($emergency_contacts as $index => $contact) {
        if (empty($contact['contact_name']) || empty($contact['contact_phone']) || empty($contact['relationship'])) {
            throw new Exception("All emergency contact fields are required for contact " . ($index + 1));
        }
        if (!preg_match('/^[0-9]{10}$/', $contact['contact_phone'])) {
            throw new Exception("Emergency contact phone number must be exactly 10 digits for contact " . ($index + 1));
        }
    }

    // Begin transaction
    $con->beginTransaction();

    // Update Users table
    $user_query = "UPDATE Users SET email = :email, phone_number = :phone_number WHERE user_id = :user_id";
    $user_stmt = $con->prepare($user_query);
    $user_stmt->execute([
        'email' => $email,
        'phone_number' => $phone_number,
        'user_id' => $user_id
    ]);

    // Update Employees table
    $employee_query = "UPDATE Employees SET dob = :dob WHERE user_id = :user_id";
    $employee_stmt = $con->prepare($employee_query);
    $employee_stmt->execute([
        'dob' => $dob,
        'user_id' => $user_id
    ]);

    // Fetch employee_id for the user
    $employee_id_query = "SELECT employee_id FROM Employees WHERE user_id = :user_id";
    $employee_id_stmt = $con->prepare($employee_id_query);
    $employee_id_stmt->execute(['user_id' => $user_id]);
    $employee_id = $employee_id_stmt->fetchColumn();
    if ($employee_id === false) {
        throw new Exception("Employee ID not found for user");
    }

    // Delete existing emergency contacts
    $delete_query = "DELETE FROM Employee_Emergency_Contacts WHERE employee_id = :employee_id";
    $delete_stmt = $con->prepare($delete_query);
    $delete_stmt->execute(['employee_id' => $employee_id]);

    // Insert new emergency contacts
    $insert_query = "INSERT INTO Employee_Emergency_Contacts (employee_id, contact_name, contact_phone, relationship) VALUES (:employee_id, :contact_name, :contact_phone, :relationship)";
    $insert_stmt = $con->prepare($insert_query);
    foreach ($emergency_contacts as $contact) {
        $insert_stmt->execute([
            'employee_id' => $employee_id,
            'contact_name' => $contact['contact_name'],
            'contact_phone' => $contact['contact_phone'],
            'relationship' => $contact['relationship']
        ]);
    }

    // Commit transaction
    $con->commit();

    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} catch (Exception $e) {
    // Rollback transaction on error
    if ($con->inTransaction()) {
        $con->rollBack();
    }
    error_log("Error in update_user_details.php: " . $e->getMessage());
    ob_end_clean();
    echo json_encode(['error' => 'Error updating profile: ' . $e->getMessage()]);
}
?>