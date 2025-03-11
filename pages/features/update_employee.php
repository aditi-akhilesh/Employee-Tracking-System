<?php
session_start();
require_once '../includes/auth_check.php';
$page_title = "HR Dashboard";

include '../auth/dbconnect.php'; // Uses $con

// Fetch departments (already present)
try {
    $stmt = $con->query("SELECT department_id, department_name FROM Department");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $departments = [];
    $_SESSION['error'] = "Failed to fetch departments: " . $e->getMessage();
}

// Fetch projects (already present)
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

// Fetch employees
try {
    $stmt = $con->query("
        SELECT 
            e.employee_id, u.first_name, u.last_name, u.email, u.role, 
            e.department_id, e.emp_hire_date, e.salary
        FROM Employees e
        JOIN Users u ON e.user_id = u.user_id
    ");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $employees = [];
    $_SESSION['error'] = "Failed to fetch employees: " . $e->getMessage();
}
?>

<!-- Rest of your HTML remains the same until the script tag -->
<script>
    const departments = <?php echo json_encode($departments); ?>;
    const projects = <?php echo json_encode($projects); ?>;
    const employees = <?php echo json_encode($employees); ?>;
    // Existing alert hide logic
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