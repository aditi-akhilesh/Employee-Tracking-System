<?php
session_start();
require_once '../../auth/authenticate.php'; // Ensure user is logged in
include '../../auth/dbconnect.php'; // Ensure $con is available

// Debug: Check if $con is valid
if (!$con) {
    die("Database connection failed. Check dbconnect.php.");
}

$page_title = "HR Dashboard";

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

// Handle form submission for updating employee
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_employee'])) {
    $employee_id = $_POST['employee_id'];
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $role = trim($_POST['role']);
    $department_id = trim($_POST['department_id']);
    $dob = trim($_POST['dob']);
    $emp_hire_date = trim($_POST['emp_hire_date']);
    $emp_job_title = trim($_POST['emp_job_title']);
    $emp_status = trim($_POST['emp_status']);
    $ssn = trim($_POST['ssn']);
    $street_name = trim($_POST['street_name']);
    $apt = trim($_POST['apt']);
    $country = trim($_POST['country']);
    $zip_code = trim($_POST['zip_code']);
    $city_name = trim($_POST['city_name']);
    $state_name = trim($_POST['state_name']);

    try {
        // Update Users table
        $stmt_user = $con->prepare("UPDATE Users SET first_name = :first_name, last_name = :last_name, email = :email, role = :role WHERE user_id = (SELECT user_id FROM Employees WHERE employee_id = :employee_id)");
        $stmt_user->execute([
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email' => $email,
            'role' => $role,
            'employee_id' => $employee_id
        ]);

        // Update Employees table
        $stmt_employee = $con->prepare("UPDATE Employees SET dob = :dob, emp_hire_date = :emp_hire_date, emp_job_title = :emp_job_title, emp_status = :emp_status, department_id = :department_id, ssn = :ssn WHERE employee_id = :employee_id");
        $stmt_employee->execute([
            'dob' => $dob,
            'emp_hire_date' => $emp_hire_date,
            'emp_job_title' => $emp_job_title,
            'emp_status' => $emp_status,
            'department_id' => $department_id,
            'ssn' => $ssn,
            'employee_id' => $employee_id
        ]);

        // Update or insert Employee_Address, Zip, City, State
        $stmt_zip = $con->prepare("SELECT z.zip_id, c.city_id, s.state_id FROM Zip z JOIN City c ON z.city_id = c.city_id JOIN State s ON c.state_id = s.state_id WHERE z.zip_code = :zip_code AND c.city_name = :city_name AND s.state_name = :state_name");
        $stmt_zip->execute(['zip_code' => $zip_code, 'city_name' => $city_name, 'state_name' => $state_name]);
        $zip_data = $stmt_zip->fetch(PDO::FETCH_ASSOC);

        if (!$zip_data) {
            $stmt_state = $con->prepare("INSERT INTO State (state_name) VALUES (:state_name) ON DUPLICATE KEY UPDATE state_id = LAST_INSERT_ID(state_id)");
            $stmt_state->execute(['state_name' => $state_name]);
            $state_id = $con->lastInsertId();

            $stmt_city = $con->prepare("INSERT INTO City (state_id, city_name) VALUES (:state_id, :city_name) ON DUPLICATE KEY UPDATE city_id = LAST_INSERT_ID(city_id)");
            $stmt_city->execute(['state_id' => $state_id, 'city_name' => $city_name]);
            $city_id = $con->lastInsertId();

            $stmt_zip_insert = $con->prepare("INSERT INTO Zip (zip_code, city_id) VALUES (:zip_code, :city_id)");
            $stmt_zip_insert->execute(['zip_code' => $zip_code, 'city_id' => $city_id]);
            $zip_id = $con->lastInsertId();
        } else {
            $zip_id = $zip_data['zip_id'];
        }

        $stmt_address = $con->prepare("INSERT INTO Employee_Address (employee_id, street_name, Apt, Country, zip_id) VALUES (:employee_id, :street_name, :apt, :country, :zip_id) ON DUPLICATE KEY UPDATE street_name = :street_name, Apt = :apt, Country = :country, zip_id = :zip_id");
        $stmt_address->execute([
            'employee_id' => $employee_id,
            'street_name' => $street_name,
            'apt' => $apt,
            'country' => $country,
            'zip_id' => $zip_id
        ]);

        $_SESSION['success'] = "Employee updated successfully!";
    } catch (PDOException $e) {
        $_SESSION['error'] = "Error updating employee: " . $e->getMessage();
    }

    header("Location: /Employee-Tracking-System/pages/features/update_remove_employees.php"); // Absolute path
    exit();
}

// Handle employee removal
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['remove_employee'])) {
    $employee_id = $_POST['employee_id'];

    try {
        $stmt_remove = $con->prepare("UPDATE Users SET is_deleted = 1 WHERE user_id = (SELECT user_id FROM Employees WHERE employee_id = :employee_id)");
        $stmt_remove->execute(['employee_id' => $employee_id]);
        $_SESSION['success'] = "Employee removed successfully!";
    } catch (PDOException $e) {
        $_SESSION['error'] = "Error removing employee: " . $e->getMessage();
    }

    header("Location: /Employee-Tracking-System/pages/features/update_remove_employees.php"); // Absolute path
    exit();
}

// Fetch all employees under this HR
try {
    $stmt_employees = $con->prepare("
        SELECT 
            e.employee_id,
            u.first_name,
            u.last_name,
            u.email,
            u.role,
            d.department_name
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id
        JOIN Department d ON e.department_id = d.department_id
        WHERE e.hr_id = :hr_id AND u.is_deleted = 0
    ");
    $stmt_employees->execute(['hr_id' => $hr_employee_id]);
    $employees = $stmt_employees->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $_SESSION['error'] = "Error fetching employees: " . $e->getMessage();
    $employees = [];
}

// Fetch departments for the update form
try {
    $stmt_dept = $con->query("SELECT department_id, department_name FROM Department");
    $departments = $stmt_dept->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
}

// Fetch employee details if updating
$update_employee = null;
if (isset($_GET['update']) && !empty($_GET['update'])) {
    $employee_id = $_GET['update'];
    try {
        $stmt_details = $con->prepare("
            SELECT 
                e.employee_id, e.dob, e.emp_hire_date, e.emp_job_title, e.emp_status, e.department_id, e.ssn,
                u.first_name, u.last_name, u.email, u.role,
                ea.street_name, ea.Apt, ea.Country,
                z.zip_code, c.city_name, s.state_name
            FROM Employees e
            JOIN Users u ON e.user_id = u.user_id
            LEFT JOIN Employee_Address ea ON e.employee_id = ea.employee_id
            LEFT JOIN Zip z ON ea.zip_id = z.zip_id
            LEFT JOIN City c ON z.city_id = c.city_id
            LEFT JOIN State s ON c.state_id = s.state_id
            WHERE e.employee_id = :employee_id AND e.hr_id = :hr_id
        ");
        $stmt_details->execute(['employee_id' => $employee_id, 'hr_id' => $hr_employee_id]);
        $update_employee = $stmt_details->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $_SESSION['error'] = "Error fetching employee details: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update or Remove Employees</title>
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/dashboard.css">
    <link rel="stylesheet" href="../../assets/css/update_remove_employees.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
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

        <?php if ($update_employee): ?>
            <div id="update-form-container" style="display: block;">
                <h3>Update Employee: <?php echo htmlspecialchars($update_employee['first_name'] . " " . $update_employee['last_name']); ?></h3>
                <form method="POST" action="update_remove_employees.php">
                    <input type="hidden" name="employee_id" value="<?php echo htmlspecialchars($update_employee['employee_id']); ?>">
                    <input type="hidden" name="update_employee" value="1">
                    <div class="form-group">
                        <label for="first_name">First Name:</label>
                        <input type="text" id="first_name" name="first_name" value="<?php echo htmlspecialchars($update_employee['first_name']); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="last_name">Last Name:</label>
                        <input type="text" id="last_name" name="last_name" value="<?php echo htmlspecialchars($update_employee['last_name']); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($update_employee['email']); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="role">Role:</label>
                        <select id="role" name="role" required>
                            <option value="User" <?php echo $update_employee['role'] === 'User' ? 'selected' : ''; ?>>User</option>
                            <option value="Manager" <?php echo $update_employee['role'] === 'Manager' ? 'selected' : ''; ?>>Manager</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="department_id">Department:</label>
                        <select id="department_id" name="department_id" required>
                            <?php foreach ($departments as $dept): ?>
                                <option value="<?php echo htmlspecialchars($dept['department_id']); ?>" <?php echo $update_employee['department_id'] === $dept['department_id'] ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($dept['department_name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dob">Date of Birth:</label>
                        <input type="date" id="dob" name="dob" value="<?php echo htmlspecialchars($update_employee['dob']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="emp_hire_date">Hire Date:</label>
                        <input type="date" id="emp_hire_date" name="emp_hire_date" value="<?php echo htmlspecialchars($update_employee['emp_hire_date']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="emp_job_title">Job Title:</label>
                        <input type="text" id="emp_job_title" name="emp_job_title" value="<?php echo htmlspecialchars($update_employee['emp_job_title']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="emp_status">Status:</label>
                        <select id="emp_status" name="emp_status">
                            <option value="Active" <?php echo $update_employee['emp_status'] === 'Active' ? 'selected' : ''; ?>>Active</option>
                            <option value="Inactive" <?php echo $update_employee['emp_status'] === 'Inactive' ? 'selected' : ''; ?>>Inactive</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ssn">SSN:</label>
                        <input type="text" id="ssn" name="ssn" value="<?php echo htmlspecialchars($update_employee['ssn']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="street_name">Street Name:</label>
                        <input type="text" id="street_name" name="street_name" value="<?php echo htmlspecialchars($update_employee['street_name']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="apt">Apartment:</label>
                        <input type="text" id="apt" name="apt" value="<?php echo htmlspecialchars($update_employee['Apt']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="country">Country:</label>
                        <input type="text" id="country" name="country" value="<?php echo htmlspecialchars($update_employee['Country']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="zip_code">Zip Code:</label>
                        <input type="text" id="zip_code" name="zip_code" value="<?php echo htmlspecialchars($update_employee['zip_code']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="city_name">City:</label>
                        <input type="text" id="city_name" name="city_name" value="<?php echo htmlspecialchars($update_employee['city_name']); ?>">
                    </div>
                    <div class="form-group">
                        <label for="state_name">State:</label>
                        <input type="text" id="state_name" name="state_name" value="<?php echo htmlspecialchars($update_employee['state_name']); ?>">
                    </div>
                    <button type="submit">Update Employee</button>
                </form>
            </div>
        <?php endif; ?>

        <?php if (empty($employees)): ?>
            <p>No employees found under your management.</p>
        <?php else: ?>
            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($employees as $employee): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($employee['employee_id']); ?></td>
                            <td><?php echo htmlspecialchars($employee['first_name']); ?></td>
                            <td><?php echo htmlspecialchars($employee['last_name']); ?></td>
                            <td><?php echo htmlspecialchars($employee['email']); ?></td>
                            <td><?php echo htmlspecialchars($employee['role']); ?></td>
                            <td><?php echo htmlspecialchars($employee['department_name']); ?></td>
                            <td>
                                <a href="update_remove_employees.php?update=<?php echo $employee['employee_id']; ?>" class="action-btn update-btn">Update</a>
                                <form method="POST" action="update_remove_employees.php" style="display:inline;" onsubmit="return confirmRemove();">
                                    <input type="hidden" name="employee_id" value="<?php echo $employee['employee_id']; ?>">
                                    <input type="hidden" name="remove_employee" value="1">
                                    <button type="submit" class="action-btn remove-btn">Remove</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>
<script src="../../assets/js/dashboard.js"></script>
<script src="../../assets/js/update_remove_employees.js"></script>
</body>
</html>