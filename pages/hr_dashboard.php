<?php
session_start();
require_once '../includes/auth_check.php';
$page_title = "HR Dashboard";

include '../auth/dbconnect.php'; // Uses $con

// Helper function to fetch data with error handling
function fetchData($con, $query, $errorMessage) {
    try {
        $stmt = $con->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $_SESSION['error'] = $errorMessage . ": " . $e->getMessage();
        return [];
    }
}

// Fetch departments with description and employee count
try {
    $stmt = $con->query("
        SELECT distinct
            d.department_id, 
            d.department_name, 
            d.department_description, 
            COUNT(e.employee_id) AS employee_count
        FROM Department d
        LEFT JOIN Employees e ON d.department_id = e.department_id where d.department_id not in ('D00','DO2') and d.department_name not in ('Head','HR Department') and  e.emp_status != 'Inactive' 
        GROUP BY d.department_id, d.department_name, d.department_description
    ");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
    $_SESSION['error'] = "Failed to fetch department information: " . $e->getMessage();
}

// Fetch projects
try {
    $stmt = $con->query("
        SELECT 
            project_id, project_name, start_date, expected_end_date, actual_end_date,
            client_name, client_contact_email, project_status, budget, actual_cost, department_id
        FROM Projects
    ");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $projects = [];
    $_SESSION['error'] = "Failed to fetch projects: " . $e->getMessage();
}

// Fetch trainings
$trainings = fetchData($con, "
    SELECT training_id, training_name, training_date, certificate, end_date, department_id
    FROM Training", "Failed to fetch trainings");

// Fetch employee trainings
$employeeTrainings = fetchData($con, "
    SELECT et.employee_training_id, et.employee_id, et.training_id, et.enrollment_date,
           et.completion_status, et.score, u.first_name, u.last_name, e.department_id
    FROM Employee_Training et
    JOIN Employees e ON et.employee_id = e.employee_id
    JOIN Users u ON e.user_id = u.user_id", "Failed to fetch employee trainings");

try {
    $stmt = $con->query("
        SELECT 
            e.employee_id, e.user_id, u.first_name, u.last_name, u.email, u.role, 
            e.department_id, e.emp_hire_date, e.salary, e.emp_status,e.manager_id,e.is_manager
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id where u.role!='Super Admin'
    ");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $employees = [];
    $_SESSION['error'] = "Failed to fetch employees: " . $e->getMessage();
}

// Handle AJAX requests for Attendance and Leave
if (isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    try {
        if ($_POST['action'] === 'fetch_leave_applications') {
            $leave_filter = $_POST['leave_filter'] ?? 'ispending';
            $stmt = $con->prepare("
                SELECT 
                    l.leave_id AS request_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    l.leave_start_date, 
                    l.leave_end_date, 
                    l.status,
                    l.leave_reason
                FROM Leaves l
                JOIN Employees e ON l.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                WHERE l.status = ?  and u.role not in ('Super Admin', 'HR')
            ");
            $stmt->execute([$leave_filter]);
            $response['leave_applications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_attendance') {
            $employee_id = $_POST['employee_id'] ?? '';
            $start_date = $_POST['start_date'] ?? '';
            $end_date = $_POST['end_date'] ?? '';

            $query = "
                SELECT 
                    a.employee_id, 
                    CONCAT(u.first_name, ' ', u.last_name) AS employee_name, 
                    d.department_name, 
                    a.check_in, 
                    a.check_out,
                    CASE 
                        WHEN a.status = 'present' THEN 'Present'
                        WHEN a.status = 'absent' THEN 'Absent'
                        ELSE a.status
                    END AS status
                FROM Attendance a
                JOIN Employees e ON a.employee_id = e.employee_id
                JOIN Users u ON e.user_id = u.user_id
                JOIN Department d ON e.department_id = d.department_id
                WHERE u.role NOT IN ('Super Admin', 'HR')
            ";
            $params = [];
            if ($employee_id) {
                $query .= " AND a.employee_id = ?";
                $params[] = $employee_id;
            }
            if ($start_date) {
                $query .= " AND DATE(a.check_in) >= ?";
                $params[] = $start_date;
            }
            if ($end_date) {
                $query .= " AND DATE(a.check_out) <= ?";
                $params[] = $end_date;
            }

            $stmt = $con->prepare($query);
            $stmt->execute($params);
            $response['attendance_records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $response['success'] = true;
        } elseif ($_POST['action'] === 'reconsider_leave') {
            $request_id = $_POST['request_id'];
            $stmt = $con->prepare("UPDATE Leaves SET status = 'ispending' WHERE leave_id = ?");
            $stmt->execute([$request_id]);
            $response['success'] = true;
            $response['message'] = "Leave application moved back to pending.";
        } elseif ($_POST['action'] === 'update_leave_status') {
            $request_id = $_POST['request_id'];
            $new_status = $_POST['status'];
            $stmt = $con->prepare("UPDATE Leaves SET status = ?, approved_by = ? WHERE leave_id = ?");
            $stmt->execute([$new_status, $_SESSION['user_id'], $request_id]); // Assuming user_id is in session
            $response['success'] = true;
            $response['message'] = "Leave application status updated to " . $new_status . ".";
        }
    } catch (PDOException $e) {
        $response['error'] = "Database error: " . $e->getMessage();
    }

    echo json_encode($response);
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        .alert { padding: 10px; margin: 10px 0; border-radius: 5px; cursor: pointer; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #003087; color: #fff; }
        .content { padding: 20px; }
        .dropdown { display: none; opacity: 0; transition: opacity 0.2s; }
        .dropdown.show { display: block; opacity: 1; }
        .reconsider-btn {
            padding: 5px 10px;
            background-color: #ff9800;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .reconsider-btn:hover { background-color: #e68900; }
        .action-form { display: inline; }
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: bold;
            color: white;
            font-size: 12px;
        }
        .status-pending { background-color: #ff9800; }
        .status-approved { background-color: #4caf50; }
        .status-rejected { background-color: #f44336; }
        .back-btn {
            padding: 8px 15px;
            background-color: #003087;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 10px;
        }
        .back-btn:hover { background-color: #002766; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input, .form-group select { width: 100%; padding: 8px; box-sizing: border-box; }
        .button-group { text-align: right; }
        .button-group button { padding: 10px 20px; margin-left: 10px; }

	/* Add styles for Font Awesome sort icons */
    	th i.fas {
        margin-left: 5px;
        vertical-align: middle;
        font-size: 0.9em;
        color: #999999;
    }
    </style>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_hr.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?> (HR)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="profile-update-form" style="display: none;"></div>
        <?php
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        }
        if (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error" onclick="this.style.display=\'none\'">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }
        ?>
    </div>
</div>

<script>
    const departments = <?php echo json_encode($departments ?: []); ?>;
    const projects = <?php echo json_encode($projects ?: []); ?>;
    let trainings = <?php echo json_encode($trainings ?: []); ?>;
    let employeeTrainings = <?php echo json_encode($employeeTrainings ?: []); ?>;
    let employees = <?php echo json_encode($employees ?: []); ?>;
    const userName = <?php echo json_encode(htmlspecialchars($_SESSION['user_name'])); ?>;
    const loggedInUserId = <?php echo json_encode($_SESSION['user_id'] ?? ''); ?>;


    // Log the data for debugging
    //console.log('Departments:', departments);
   // console.log('Projects:', projects);
   // console.log('Trainings:', trainings);
   // console.log('Employee Trainings:', employeeTrainings);
   // console.log('Employees:', employees);
  //  console.log('User Name:', userName);

    // Check if data is available
    if (!departments.length || !projects.length || !trainings.length || !employeeTrainings.length || !employees.length) {
        console.warn("Some data could not be loaded. Functionality may be limited.");
    }

    document.addEventListener('click', function(event) {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            if (!alert.contains(event.target)) {
                alert.style.display = 'none';
            }
        });
    });
</script>

<script src="../assets/js/dashboard.js"></script>
</body>
</html>