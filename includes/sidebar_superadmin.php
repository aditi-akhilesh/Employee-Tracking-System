<div class="sidebar">
    <ul class="sidebar-menu">
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')"><i class="fas fa-users"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showCreateUserForm()">Create new profile</a></li>
                <li><a href="#"  onclick="showUpdateRemoveUserForm()">Update or remove employee or manager</a></li>
                <li><a href="#" onclick="showAllEmployees()">View all employees or managers</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')"><i class="fas fa-clock"></i> Attendance and Leave</a>
            <ul id="attendance-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showAttendanceRecords()">View attendance records</a></li>
                <li><a href="#" onclick="showLeaveRequests()">Approve/reject leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'department-dropdown')"><i class="fas fa-building"></i> Department Management</a>
            <ul id="department-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showDepartmentManagement()">Manage department</a></li>
                <li><a href="#" onclick="showDepartment()">Track department information</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')"><i class="fas fa-tasks"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="trackProjectStatus()">Track Project Status</a></li>
                <li><a href="#" onclick="showEmployeeDistribution()">Show Employee Distribution</a></li>
                <li><a href="#" onclick="trackTasksStatus()">Track Tasks Status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')"><i class="fas fa-graduation-cap"></i> Training</a>
            <ul id="training-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showTrainingPrograms()">View Training Programs</a></li>
                <li><a href="#" onclick="showTrainingAssignments()">View Training Assignments</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'reports-dropdown')"><i class="fas fa-chart-bar"></i> Reports & Analytics</a>
            <ul id="reports-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showReportsAnalytics()">Generate reports of an employee</a></li>
                <li><a href="#" onclick="showDepartmentMetrics()">View department-wise performance metrics</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'audit-dropdown')"><i class="fas fa-file-alt"></i> Audits</a>
            <ul id="audit-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showAuditLogs()">Track audit logs</a></li>
            </ul>
        </li>
    </ul>
</div>

