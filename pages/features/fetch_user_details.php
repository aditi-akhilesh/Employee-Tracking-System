<?php
// fetch_user_details.php

// Temporarily enable error display for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering to capture any unintended output
ob_start();

session_start();
require_once '../../auth/dbconnect.php';

try {
    // Debug: Check if $con is defined and is a valid PDO object
    if (!isset($con)) {
        error_log("db_connect.php did not define \$con variable");
        throw new Exception("Database connection failed: \$con is not defined");
    }
    if (!$con instanceof PDO) {
        error_log("\$con is not a valid PDO object: " . print_r($con, true));
        throw new Exception("Database connection failed: \$con is not a valid PDO object");
    }

    // Test the connection by running a simple query
    $test_query = "SELECT 1";
    $test_stmt = $con->query($test_query);
    if ($test_stmt === false) {
        error_log("Test query failed: " . print_r($con->errorInfo(), true));
        throw new Exception("Database connection test failed: " . $con->errorInfo()[2]);
    }
    error_log("Database connection successful in fetch_user_details.php");

    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        error_log("User ID not found in session: " . print_r($_SESSION, true));
        throw new Exception("Unauthorized: User is not authenticated");
    }

    $user_id = $_SESSION['user_id'];
    error_log("User ID: " . $user_id);

    // Fetch user details from the Users table
    $user_query = "SELECT first_name, middle_name, last_name, email, phone_number FROM Users WHERE user_id = :user_id";
    $user_stmt = $con->prepare($user_query);
    if (!$user_stmt) {
        throw new Exception("Failed to prepare user query: " . $con->errorInfo()[2]);
    }
    $user_stmt->execute(['user_id' => $user_id]);
    $user = $user_stmt->fetch(PDO::FETCH_ASSOC);
    if ($user === false || !$user) {
        error_log("User not found for user_id: " . $user_id);
        throw new Exception("User not found");
    }
    error_log("User data: " . print_r($user, true));

    // Fetch employee details from the Employees table
    $employee_query = "SELECT employee_id, department_id, manager_id, dob, emp_hire_date, emp_status FROM Employees WHERE user_id = :user_id";
    $employee_stmt = $con->prepare($employee_query);
    if (!$employee_stmt) {
        throw new Exception("Failed to prepare employee query: " . $con->errorInfo()[2]);
    }
    $employee_stmt->execute(['user_id' => $user_id]);
    $employee = $employee_stmt->fetch(PDO::FETCH_ASSOC);
    if ($employee === false || !$employee) {
        error_log("Employee details not found for user_id: " . $user_id);
        throw new Exception("Employee details not found");
    }
    error_log("Employee data: " . print_r($employee, true));

    // Fetch emergency contacts from the Employee_Emergency_Contacts table
    $emergency_query = "SELECT contact_name, contact_phone, relationship FROM Employee_Emergency_Contacts WHERE employee_id = :employee_id";
    $emergency_stmt = $con->prepare($emergency_query);
    if (!$emergency_stmt) {
        throw new Exception("Failed to prepare emergency contacts query: " . $con->errorInfo()[2]);
    }
    $emergency_stmt->execute(['employee_id' => $employee['employee_id']]);
    $emergency_contacts = $emergency_stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Emergency contacts data: " . print_r($emergency_contacts, true));

    // Combine user and employee details
    $user_details = array_merge($user, $employee);
    $user_details['emergency_contacts'] = $emergency_contacts;

    // Process the data (ensure consistent formatting)
    $user_details['employee_id'] = isset($user_details['employee_id']) ? (string)$user_details['employee_id'] : '';
    $user_details['department_id'] = isset($user_details['department_id']) ? (string)$user_details['department_id'] : '';
    $user_details['manager_id'] = isset($user_details['manager_id']) ? (string)$user_details['manager_id'] : '';
    $user_details['first_name'] = isset($user_details['first_name']) ? (string)$user_details['first_name'] : '';
    $user_details['middle_name'] = isset($user_details['middle_name']) ? (string)$user_details['middle_name'] : '';
    $user_details['last_name'] = isset($user_details['last_name']) ? (string)$user_details['last_name'] : '';
    $user_details['email'] = isset($user_details['email']) ? (string)$user_details['email'] : '';
    $user_details['phone_number'] = isset($user_details['phone_number']) ? (string)$user_details['phone_number'] : '';
    $user_details['dob'] = isset($user_details['dob']) ? (string)$user_details['dob'] : '';
    $user_details['emp_hire_date'] = isset($user_details['emp_hire_date']) ? (string)$user_details['emp_hire_date'] : '';
    $user_details['emp_status'] = isset($user_details['emp_status']) ? (string)$user_details['emp_status'] : '';
    $user_details['emergency_contacts'] = $emergency_contacts ?: [];

    error_log("Processed user details: " . print_r($user_details, true));

    // Output the JSON response
    header('Content-Type: application/json');
    header('Cache-Control: no-cache');
    ob_end_clean();
    echo json_encode($user_details);
} catch (PDOException $e) {
    error_log("PDOException in fetch_user_details.php: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    ob_end_clean();
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Error in fetch_user_details.php: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    ob_end_clean();
    echo json_encode(['error' => 'Error fetching user details: ' . $e->getMessage()]);
}
?>