<?php
session_start();

// Prevent any output before JSON response
ob_start();

require_once '../../auth/dbconnect.php';

$currentUser = intval($_SESSION['user_id']);
$con->exec("SET @current_user_id := {$currentUser}");

header('Content-Type: application/json');
$response = ['success' => false];

// Ensure user is authenticated
$employee_id = $_SESSION['employee_id'] ?? null;
if (!$employee_id) {
    $response['error'] = 'Unauthorized';
    echo json_encode($response);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['error'] = 'Invalid request method';
    echo json_encode($response);
    exit();
}

// Handle AJAX requests for Leave Requests
if (isset($_POST['action'])) {
    try {
        if ($_POST['action'] === 'apply_leave') {
            // Sanitize and validate inputs
            $leave_type_id = filter_var($_POST['leave_type_id'] ?? '', FILTER_SANITIZE_NUMBER_INT);
            $start_date = $_POST['start_date'] ?? '';
            $end_date = $_POST['end_date'] ?? '';
            $leave_reason = htmlspecialchars(trim($_POST['leave_reason'] ?? ''), ENT_QUOTES, 'UTF-8');

            // Validation
            if (empty($leave_type_id) || empty($start_date) || empty($end_date) || empty($leave_reason)) {
                $response['error'] = 'Missing required fields';
                echo json_encode($response);
                exit();
            }

            $today = date('Y-m-d');
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $start_date) || $start_date < $today) {
                $response['error'] = 'Start date must be today or in the future';
                echo json_encode($response);
                exit();
            }

            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $end_date) || $end_date < $start_date) {
                $response['error'] = 'End date must be on or after start date';
                echo json_encode($response);
                exit();
            }

            // Debug: Log the input dates
            error_log("Applying leave for employee_id: $employee_id, start_date: $start_date, end_date: $end_date");

            // Check for overlapping leave requests
            $stmt = $con->prepare("
                SELECT COUNT(*) 
                FROM Leaves 
                WHERE employee_id = ? 
                AND leave_start_date <= ? 
                AND leave_end_date >= ?
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare overlap check query: ' . implode(' ', $con->errorInfo()));
            }
            $executed = $stmt->execute([$employee_id, $end_date, $start_date]);
            if (!$executed) {
                throw new Exception('Failed to execute overlap check query: ' . implode(' ', $stmt->errorInfo()));
            }
            $overlap_count = $stmt->fetchColumn();

            // Debug: Log the overlap count
            error_log("Overlap count: $overlap_count");

            if ($overlap_count === false) {
                throw new Exception('Failed to fetch overlap count');
            }

            if ($overlap_count > 0) {
                $response['error'] = 'Leave request for this period already exists';
                echo json_encode($response);
                exit();
            }

            // Check leave balance
            $stmt = $con->prepare("
                SELECT total_days_allocated, days_used 
                FROM Leave_Balance 
                WHERE employee_id = ? AND leave_type_id = ?
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare leave balance query: ' . implode(' ', $con->errorInfo()));
            }
            $executed = $stmt->execute([$employee_id, $leave_type_id]);
            if (!$executed) {
                throw new Exception('Failed to execute leave balance query: ' . implode(' ', $stmt->errorInfo()));
            }
            $balance = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$balance || !isset($balance['total_days_allocated']) || !isset($balance['days_used'])) {
                $response['error'] = 'Leave balance not found for this leave type';
                echo json_encode($response);
                exit();
            }

            $days_requested = (strtotime($end_date) - strtotime($start_date)) / (60 * 60 * 24) + 1;
            $available_days = (float)$balance['total_days_allocated'] - (float)$balance['days_used'];

            if ($days_requested > $available_days) {
                $response['error'] = "Insufficient leave balance. Available days: $available_days";
                echo json_encode($response);
                exit();
            }

            // Begin a transaction to ensure data consistency
            $transaction_supported = true;
            try {
                $con->beginTransaction();
            } catch (PDOException $e) {
                $transaction_supported = false;
                error_log("Transactions not supported: " . $e->getMessage());
            }

            if ($transaction_supported) {
                try {
                    // Insert leave request with status 'ispending' and leave_reason
                    $stmt = $con->prepare("
                        INSERT INTO Leaves (employee_id, leave_type_id, leave_start_date, leave_end_date, status, leave_reason)
                        VALUES (?, ?, ?, ?, 'ispending', ?)
                    ");
                    if (!$stmt) {
                        throw new Exception('Failed to prepare leave insertion query: ' . implode(' ', $con->errorInfo()));
                    }
                    $executed = $stmt->execute([$employee_id, $leave_type_id, $start_date, $end_date, $leave_reason]);
                    if (!$executed) {
                        throw new Exception('Failed to execute leave insertion query: ' . implode(' ', $stmt->errorInfo()));
                    }

                    // Update leave balance
                    $stmt = $con->prepare("
                        UPDATE Leave_Balance 
                        SET days_used = days_used + ?,
                            total_days_allocated = GREATEST(0, total_days_allocated - ?),
                            last_updated = CURDATE()
                        WHERE employee_id = ? AND leave_type_id = ?
                    ");
                    if (!$stmt) {
                        throw new Exception('Failed to prepare leave balance update query: ' . implode(' ', $con->errorInfo()));
                    }
                    $executed = $stmt->execute([$days_requested, $days_requested, $employee_id, $leave_type_id]);
                    if (!$executed) {
                        throw new Exception('Failed to execute leave balance update query: ' . implode(' ', $stmt->errorInfo()));
                    }

                    // Commit the transaction
                    $con->commit();
                    $response['success'] = true;
                    $response['message'] = 'Leave application submitted successfully';
                } catch (Throwable $e) {
                    $con->rollBack();
                    $response['error'] = 'Error applying leave: ' . $e->getMessage();
                    error_log("Error applying leave: " . $e->getMessage());
                }
            } else {
                // Fallback: Proceed without transactions
                try {
                    // Insert leave request with status 'ispending' and leave_reason
                    $stmt = $con->prepare("
                        INSERT INTO Leaves (employee_id, leave_type_id, leave_start_date, leave_end_date, status, leave_reason)
                        VALUES (?, ?, ?, ?, 'ispending', ?)
                    ");
                    if (!$stmt) {
                        throw new Exception('Failed to prepare leave insertion query: ' . implode(' ', $con->errorInfo()));
                    }
                    $executed = $stmt->execute([$employee_id, $leave_type_id, $start_date, $end_date, $leave_reason]);
                    if (!$executed) {
                        throw new Exception('Failed to execute leave insertion query: ' . implode(' ', $stmt->errorInfo()));
                    }

                    // Update leave balance
                    $stmt = $con->prepare("
                        UPDATE Leave_Balance 
                        SET days_used = days_used + ?,
                            total_days_allocated = GREATEST(0, total_days_allocated - ?),
                            last_updated = CURDATE()
                        WHERE employee_id = ? AND leave_type_id = ?
                    ");
                    if (!$stmt) {
                        throw new Exception('Failed to prepare leave balance update query: ' . implode(' ', $con->errorInfo()));
                    }
                    $executed = $stmt->execute([$days_requested, $days_requested, $employee_id, $leave_type_id]);
                    if (!$executed) {
                        throw new Exception('Failed to execute leave balance update query: ' . implode(' ', $stmt->errorInfo()));
                    }

                    $response['success'] = true;
                    $response['message'] = 'Leave application submitted successfully';
                } catch (Throwable $e) {
                    $response['error'] = 'Error applying leave: ' . $e->getMessage();
                    error_log("Error applying leave: " . $e->getMessage());
                }
            }
        } elseif ($_POST['action'] === 'fetch_leave_requests') {
            $leave_filter = $_POST['leave_filter'] ?? 'ispending';
            if (!in_array($leave_filter, ['ispending', 'approved', 'rejected'])) {
                $response['error'] = 'Invalid leave filter';
                echo json_encode($response);
                exit();
            }

            $stmt = $con->prepare("
                SELECT 
                    l.leave_id, l.leave_start_date, l.leave_end_date, l.status, lt.leave_name
                FROM Leaves l
                JOIN Leave_Type lt ON l.leave_type_id = lt.leave_type_id
                WHERE l.employee_id = ? AND l.status = ?
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare fetch leave requests query: ' . implode(' ', $con->errorInfo()));
            }
            $executed = $stmt->execute([$employee_id, $leave_filter]);
            if (!$executed) {
                throw new Exception('Failed to execute fetch leave requests query: ' . implode(' ', $stmt->errorInfo()));
            }
            $leave_requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response['leave_requests'] = $leave_requests;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_leave_balance') {
            $stmt = $con->prepare("
                SELECT 
                    lb.leave_type_id, lt.leave_name, lb.total_days_allocated, lb.days_used,
                    (lb.total_days_allocated - lb.days_used) AS remaining_days
                FROM Leave_Balance lb
                JOIN Leave_Type lt ON lb.leave_type_id = lt.leave_type_id
                WHERE lb.employee_id = ? AND lt.status = 'active'
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare fetch leave balance query: ' . implode(' ', $con->errorInfo()));
            }
            $executed = $stmt->execute([$employee_id]);
            if (!$executed) {
                throw new Exception('Failed to execute fetch leave balance query: ' . implode(' ', $stmt->errorInfo()));
            }
            $leave_balances = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response['leave_balances'] = $leave_balances;
            $response['success'] = true;
        } elseif ($_POST['action'] === 'fetch_leave_types') {
            $stmt = $con->prepare("
                SELECT leave_type_id, leave_name
                FROM Leave_Type
                WHERE status = 'active'
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare fetch leave types query: ' . implode(' ', $con->errorInfo()));
            }
            $executed = $stmt->execute();
            if (!$executed) {
                throw new Exception('Failed to execute fetch leave types query: ' . implode(' ', $stmt->errorInfo()));
            }
            $leave_types = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response['leave_types'] = $leave_types;
            $response['success'] = true;
        }
    } catch (Exception $e) {
        $response['error'] = 'Database error: ' . $e->getMessage();
        error_log("Error in leave_request.php: " . $e->getMessage());
    }
}

// Clear any output buffer and send JSON response
ob_end_clean();
echo json_encode($response);
exit();
?>