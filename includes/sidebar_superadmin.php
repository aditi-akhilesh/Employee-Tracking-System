<div class="sidebar">
    <ul class="sidebar-menu">
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')"><i class="fas fa-users"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown" style="display: none;">
                <li><a href="#" onclick="showCreateUserForm()">Create new profile</a></li>
                <li><a href="#">Update or remove employee or manager</a></li>
                <li><a href="#">View all employees or managers</a></li>
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
                <li><a href="#">Update department assignment</a></li>
                <li><a href="#">Track department information</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')"><i class="fas fa-tasks"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown" style="display: none;">
                <li><a href="#">Add new project to department</a></li>
                <li><a href="#">Add new tasks to project</a></li>
                <li><a href="#">Track project status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')"><i class="fas fa-graduation-cap"></i> Training Management</a>
            <ul id="training-dropdown" class="dropdown" style="display: none;">
                <li><a href="#">Add/manage training programs</a></li>
                <li><a href="#">Assign employees to training</a></li>
                <li><a href="#">View training status</a></li>
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
                <li><a href="#">Track audit logs</a></li>
            </ul>
        </li>
    </ul>
</div>