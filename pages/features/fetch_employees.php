<?php
session_start();
require_once '../../auth/dbconnect.php';

try {
    // Debug: Log the database connection status
    if (!$con) {
        throw new Exception("Database connection failed");
    }
    error_log("Database connection successful");

    $stmt = $con->prepare("SELECT e.employee_id, u.first_name, u.last_name, u.email, u.role,e.dob, e.department_id, e.emp_hire_date, e.salary, e.manager_id, e.emp_status, e.is_manager FROM Employees e JOIN Users u ON e.user_id = u.user_id where e.emp_status != 'Inactive'  and u.role !='Super Admin'");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $con->error);
    }
    error_log("SQL statement prepared successfully");

    $stmt->execute();
    error_log("SQL statement executed successfully");

    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($employees === false) {
        throw new Exception("Failed to fetch employees: " . $stmt->error);
    }
    error_log("Raw employees data before processing: " . print_r($employees, true));

    // Check for duplicate employee_id values
    $employee_ids = array_column($employees, 'employee_id');
    $duplicates = array_filter(array_count_values($employee_ids), function($count) {
        return $count > 1;
    });
    if (!empty($duplicates)) {
        error_log("Duplicate employee_id values found: " . print_r($duplicates, true));
    }

    // Process the employees array
    foreach ($employees as &$emp) {
        $emp['employee_id'] = isset($emp['employee_id']) ? preg_replace('/[^0-9]/', '', (string)$emp['employee_id']) : '';
        $emp['first_name'] = isset($emp['first_name']) ? $emp['first_name'] : '';
        $emp['last_name'] = isset($emp['last_name']) ? $emp['last_name'] : '';
        $emp['email'] = isset($emp['email']) ? $emp['email'] : '';
        $emp['role'] = isset($emp['role']) ? $emp['role'] : '';
        $emp['department_id'] = isset($emp['department_id']) ? $emp['department_id'] : '';
        $emp['emp_hire_date'] = isset($emp['emp_hire_date']) ? $emp['emp_hire_date'] : '';
        $emp['salary'] = isset($emp['salary']) ? number_format((float)$emp['salary'], 2, '.', '') : '0.00';
        $emp['manager_id'] = isset($emp['manager_id']) && $emp['manager_id'] !== null ? preg_replace('/[^0-9]/', '', (string)$emp['manager_id']) : '';
        $emp['emp_status'] = isset($emp['emp_status']) ? $emp['emp_status'] : '';
        $emp['is_manager'] = isset($emp['is_manager']) ? (string)$emp['is_manager'] : '0';

        if (!isset($emp['manager_id'])) {
            error_log("manager_id missing for employee_id: " . $emp['employee_id']);
        }
    }

    error_log("Processed employees data: " . print_r($employees, true));

    header('Content-Type: application/json');
    header('Cache-Control: no-cache');
    echo json_encode($employees);
} catch (Exception $e) {
    error_log("Error in fetch_employees.php: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Error fetching employees: ' . $e->getMessage()]);
}
?>