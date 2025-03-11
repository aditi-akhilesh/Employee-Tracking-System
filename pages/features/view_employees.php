<?php
session_start();
require_once '../../auth/authenticate.php'; // Ensure user is logged in
include '../../auth/dbconnect.php'; // Ensure $con is available

// Debug: Check if $con is valid
if (!$con) {
    die("Database connection failed. Check dbconnect.php.");
}


// Get the logged-in HR's user_id from session
$hr_user_id = $_SESSION['user_id'];

// Fetch the HR's employee_id from the Employees table
try {
    $stmt_hr = $con->prepare("SELECT employee_id FROM Employees WHERE user_id = :user_id AND is_hr = 1");
    $stmt_hr->execute(['user_id' => $hr_user_id]);
    $hr_data = $stmt_hr->fetch(PDO::FETCH_ASSOC);

    if (!$hr_data) {
        $_SESSION['error'] = "HR profile not found.";
        header("Location: /Employee-Tracking-System/pages/hr_dashboard.php");
        exit();
    }

    $hr_employee_id = $hr_data['employee_id'];
} catch (PDOException $e) {
    $_SESSION['error'] = "Error fetching HR data: " . $e->getMessage();
    header("Location: /Employee-Tracking-System/pages/hr_dashboard.php");
    exit();
}

// Fetch employees under this HR
try {
    $stmt_employees = $con->prepare("
        SELECT 
            u.user_id, u.first_name, u.middle_name, u.last_name, u.email, 
            d.department_name, u.role, u.phone_number, 
            e.emp_hire_date, ec.contact_name, ec.contact_phone, ec.relationship
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id
        JOIN Department d ON e.department_id = d.department_id
        LEFT JOIN Employee_Emergency_Contacts ec ON e.employee_id = ec.employee_id
        WHERE e.hr_id = :hr_id AND u.is_deleted = 0
    ");
    $stmt_employees->execute(['hr_id' => $hr_employee_id]);
    $employees = $stmt_employees->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $_SESSION['error'] = "Error fetching employees: " . $e->getMessage();
    $employees = [];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Employees</title>
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/dashboard.css">
    <link rel="stylesheet" href="../../assets/css/view_employees.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        .employee-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .employee-table th {
            background-color: #0d47a1;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .employee-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }
        .employee-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .employee-table tr:hover {
            background-color: #f1f1f1;
        }
    </style>
</head>
<body>
<?php include '../../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../../includes/sidebar_hr.php'; ?>
    <div class="content" id="content-area">
        <h2>Employees Under Your Management</h2>
        
        <?php if (isset($_SESSION['error'])): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['success'])): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
        <?php endif; ?>

        <?php if (empty($employees)): ?>
            <p>No employees found under your management.</p>
        <?php else: ?>
            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Phone Number</th>
                        <th>Hire Date</th>
                        <th>Emergency Contact</th>
                        <th>Emergency Phone</th>
                        <th>Relationship</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($employees as $employee): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($employee['user_id']); ?></td>
                            <td><?php echo htmlspecialchars($employee['first_name']); ?></td>
                            <td><?php echo htmlspecialchars($employee['middle_name'] ?: 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($employee['last_name']); ?></td>
                            <td><?php echo htmlspecialchars($employee['email']); ?></td>
                            <td><?php echo htmlspecialchars($employee['department_name']); ?></td>
                            <td><?php echo htmlspecialchars($employee['role']); ?></td>
                            <td><?php echo htmlspecialchars($employee['phone_number'] ?: 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($employee['emp_hire_date']); ?></td>
                            <td><?php echo htmlspecialchars($employee['contact_name'] ?: 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($employee['contact_phone'] ?: 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($employee['relationship'] ?: 'N/A'); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>
<script src="../../assets/js/dashboard.js"></script>
</body>
</html>
