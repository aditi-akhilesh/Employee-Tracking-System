<?php
require_once '../includes/auth_check.php'; // Ensure this checks for Manager role
require_once '../auth/dbconnect.php'; // Uses $con

$page_title = "Manager Dashboard";

// Fetch employees assigned to this manager, their feedback, and report data
$manager_id = $_SESSION['employee_id']; // From authenticate.php
function fetchData($con, $manager_id) {
    $data = [];

    // Employees assigned to this manager
    $stmt = $con->prepare("
        SELECT e.employee_id, e.user_id, e.emp_job_title, e.emp_status, u.first_name, u.last_name, u.email 
        FROM Employees e 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE e.manager_id = :manager_id AND e.emp_status != 'inactive' AND u.is_active = 1
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Employees for manager_id $manager_id: " . print_r($data['employees'], true));

    // Feedback given by this manager
    $stmt = $con->prepare("
        SELECT f.feedback_id, f.employee_id, f.rating, f.feedback_type, f.feedback_text, f.date_submitted, 
               u.first_name, u.last_name 
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['feedback'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Average rating per employee
    $stmt = $con->prepare("
        SELECT e.employee_id, u.first_name, u.last_name, AVG(f.rating) as avg_rating, COUNT(f.feedback_id) as feedback_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        JOIN Users u ON e.user_id = u.user_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY e.employee_id, u.first_name, u.last_name
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_avg_ratings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Report data: Feedback type distribution
    $stmt = $con->prepare("
        SELECT f.feedback_type, COUNT(f.feedback_id) as type_count
        FROM Feedback f 
        JOIN Employees e ON f.employee_id = e.employee_id 
        WHERE f.reviewer_id = :manager_id
        GROUP BY f.feedback_type
    ");
    $stmt->execute(['manager_id' => $manager_id]);
    $data['report_feedback_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $data;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $response = ['success' => false];

    if ($_POST['action'] === 'refresh_data') {
        $data = fetchData($con, $manager_id);
        $response['success'] = true;
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

// Initial page load
$data = fetchData($con, $manager_id);
$employees = $data['employees'];
$feedback = $data['feedback'];
$report_avg_ratings = $data['report_avg_ratings'];
$report_feedback_types = $data['report_feedback_types'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <!-- Add html2canvas and jsPDF libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <!-- Fallback for jsPDF and html2canvas if CDN fails -->
    <script>
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF not loaded from CDN, loading fallback...');
            document.write('<script src="../assets/js/jspdf.umd.min.js"><\/script>');
        }
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas not loaded from CDN, loading fallback...');
            document.write('<script src="../assets/js/html2canvas.min.js"><\/script>');
        }
    </script>
</head>
<body>
<?php include '../includes/header.php'; ?>
<div class="dashboard-container">
    <?php include '../includes/sidebar_manager.php'; ?>
    <div class="content" id="content-area">
        <div id="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?> (Manager)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        </div>
        <div id="profile-update-form" style="display: none;"></div>
        <div id="reports-analytics" style="display: none;">
            <h2>Reports and Analytics</h2>
            <div class="report-filter">
                <div class="form-group">
                    <label for="employee-search">Search Employee:</label>
                    <select id="employee-search" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                        <option value="">Select an employee</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo htmlspecialchars($emp['employee_id']); ?>">
                                <?php echo htmlspecialchars($emp['first_name'] . ' ' . $emp['last_name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                    <button type="button" id="generate-report-btn" style="padding: 10px 20px; background-color: #003087; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                            onmouseover="this.style.backgroundColor='#00205b'" 
                            onmouseout="this.style.backgroundColor='#003087'">Generate Report</button>
                </div>
            </div>
            <div class="report-section" id="report-content" style="display: none;">
                <div class="report-section" style="margin-top: 20px;">
                    <h3>Average Ratings per Employee</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Average Rating</th>
                                <th>Feedback Count</th>
                            </tr>
                        </thead>
                        <tbody id="avg-ratings-table">
                            <!-- Populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
                <div class="report-section" style="margin-top: 20px;">
                    <h3>Feedback Type Distribution</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Feedback Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-types-table">
                            <!-- Populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
                <div class="report-section" style="margin-top: 20px;">
                    <h3>Feedback Summary</h3>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Rating</th>
                                <th>Feedback Type</th>
                                <th>Feedback Details</th>
                                <th>Date Submitted</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-summary-table">
                            <!-- Populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
                <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                    <button type="button" id="download-pdf-btn" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                            onmouseover="this.style.backgroundColor='#218838'" 
                            onmouseout="this.style.backgroundColor='#28a745'">Download PDF</button>
                </div>
            </div>
        </div>
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
    const employees = <?php echo json_encode($employees); ?>;
    const feedback = <?php echo json_encode($feedback); ?>;
    const reportAvgRatings = <?php echo json_encode($report_avg_ratings); ?>;
    const reportFeedbackTypes = <?php echo json_encode($report_feedback_types); ?>;
    const userName = "<?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Manager'); ?>";
    const managerId = <?php echo json_encode($manager_id); ?>;

    // Refresh data on page load
    document.addEventListener('DOMContentLoaded', function() {
        refreshData();
    });
</script>
<script src="../assets/js/dashboard.js"></script>
<script src="../assets/js/manager_dashboard.js"></script>
</body>
</html>