<?php
// update_password.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../../auth/dbconnect.php'; // Adjust the path as needed

// Check if the user is authenticated
if (!isset($_SESSION['employee_id'])) {
  echo json_encode(['success' => false, 'error' => 'Not authenticated. Please log in.']);
  exit();
}

$employee_id = $_SESSION['employee_id'];

// Get the user_id associated with the employee_id
try {
  $stmt = $con->prepare("SELECT user_id FROM Employees WHERE employee_id = :employee_id");
  $stmt->execute(['employee_id' => $employee_id]);
  $user_id = $stmt->fetchColumn();
  if ($user_id === false) {
    echo json_encode(['success' => false, 'error' => 'User not found for the given employee ID.']);
    exit();
  }
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => 'Database error fetching user ID: ' . $e->getMessage()]);
  exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Get the new password
  $new_password = trim($_POST['new_password'] ?? '');

  // Server-side validation
  if (empty($new_password)) {
    echo json_encode(['success' => false, 'error' => 'New password is required.']);
    exit();
  }

  // Password strength validation (same as client-side for consistency)
  if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/', $new_password)) {
    echo json_encode([
      'success' => false,
      'error' => 'Password must be at least 8 characters long and contain at least one letter and one number.'
    ]);
    exit();
  }

  try {
    // Hash the new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    if ($hashed_password === false) {
      throw new Exception('Password hashing failed.');
    }

    // Update the password in the Users table
    $stmt = $con->prepare("UPDATE Users SET password_hash = :password_hash WHERE user_id = :user_id");
    $stmt->execute([
      'password_hash' => $hashed_password,
      'user_id' => $user_id
    ]);

    echo json_encode(['success' => true, 'message' => 'Password updated successfully!']);
  } catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
  } catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>