1.
INSERT INTO
Leave_Type (leave_type_id, leave_name, is_paid, default_days_per_year, status)
VALUES
(1, 'Sick Leave', TRUE, 10, 'active'),
(2, 'Vacation Leave', TRUE, 15, 'active'),
(3, 'Personal Leave', FALSE, 5, 'active'),
(4, 'Maternity Leave', TRUE, 90, 'active'),
(5, 'Paternity Leave', TRUE, 10, 'active');


2.
ALTER TABLE Leaves MODIFY COLUMN status ENUM('ispending', 'approved', 'rejected') NOT NULL;

3.
INSERT INTO Leaves (leave_id, employee_id, leave_type_id, leave_start_date, leave_end_date, status, approved_by) VALUES
-- Employee 1
(1, 1, 2, '2025-03-15', '2025-03-20', 'ispending', NULL), -- Vacation Leave, pending
(2, 1, 1, '2025-02-01', '2025-02-02', 'approved', 17),    -- Sick Leave, approved
-- Employee 3
(3, 3, 1, '2025-03-10', '2025-03-11', 'approved', 17),    -- Sick Leave, approved
-- Employee 5
(4, 5, 5, '2025-03-20', '2025-03-25', 'approved', 17);    -- Paternity Leave, approved

4.
INSERT INTO Leave_Type (leave_type_id, leave_name, is_paid, default_days_per_year, status) VALUES
(1, 'Sick Leave', TRUE, 10, 'active'),
(2, 'Vacation Leave', TRUE, 15, 'active'),
(3, 'Personal Leave', FALSE, 5, 'active'),
(4, 'Maternity Leave', TRUE, 90, 'active'),
(5, 'Paternity Leave', TRUE, 10, 'active');

5.
UPDATE Leave_Balance lb
    JOIN (
    SELECT employee_id, leave_type_id, SUM(DATEDIFF(leave_end_date, leave_start_date) + 1) AS used_days
    FROM Leaves
    WHERE status = 'approved'
    GROUP BY employee_id, leave_type_id
    ) l ON lb.employee_id = l.employee_id AND lb.leave_type_id = l.leave_type_id
    SET lb.days_used = l.used_days
WHERE lb.days_used != l.used_days;

6.
INSERT INTO Attendance (attendance_id, employee_id, check_in, check_out, status, leave_id) VALUES
-- Employee 1
(3, 1, NULL, NULL, 'Absent', NULL),
-- Employee 2
(4, 2, '2025-03-09 08:00:00', '2025-03-09 17:00:00', 'Present', NULL),
(5, 2, '2025-03-10 09:15:00', '2025-03-10 17:00:00', 'Remote', NULL),
(6, 2, NULL, NULL, 'Absent', NULL),
-- Employee 3 (On leave March 10-11, leave_id 3)
(7, 3, '2025-03-09 08:00:00', '2025-03-09 17:00:00', 'Present', NULL),
(8, 3, NULL, NULL, 'Leave', 3), -- March 10, on leave
(9, 3, NULL, NULL, 'Leave', 3), -- March 11, on leave
-- Employee 4
(10, 4, '2025-03-09 08:00:00', '2025-03-09 17:00:00', 'Present', NULL),
(11, 4, NULL, NULL, 'Absent', NULL),
(12, 4, '2025-03-11 08:00:00', '2025-03-11 17:00:00', 'Present', NULL),
-- Employee 5
(13, 5, '2025-03-09 08:00:00', '2025-03-09 17:00:00', 'Present', NULL),
(14, 5, '2025-03-10 08:00:00', '2025-03-10 17:00:00', 'Present', NULL),
(15, 5, '2025-03-11 09:30:00', '2025-03-11 17:00:00', 'Present', NULL);

7.
INSERT INTO Attendance (attendance_id, employee_id, check_in, check_out, status, leave_id)
VALUES Employee 1(1, 1, '2025-03-09 08:00:00', '2025-03-09 17:00:00', 'Present', NULL),
(2, 1, '2025-03-10 09:15:00', '2025-03-10 17:00:00', 'Late', NULL);