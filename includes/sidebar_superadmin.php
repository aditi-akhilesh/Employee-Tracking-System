<div class="sidebar">
    <ul>
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')"><i class="fas fa-users"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown">
                <li><a href="#" onclick="showCreateUserForm()">Create new profile</a></li>
                <li><a href="#">Update or remove employee or manager</a></li>
                <li><a href='#'>View all employees or managers</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')"><i class="fas fa-clock"></i> Attendance and Leave</a>
            <ul id="attendance-dropdown" class="dropdown">
                <li><a href="#">View attendance records</a></li>
                <li><a href="#">Approve/reject leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'department-dropdown')"><i class="fas fa-building"></i> Department Management</a>
            <ul id="department-dropdown" class="dropdown">
                <li><a href="#">Add new department</a></li>
                <li><a href="#">Update department assignment</a></li>
                <li><a href="#">Track department information</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')"><i class="fas fa-tasks"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown">
                <li><a href="#">Add new project to department</a></li>
                <li><a href="#">Add new tasks to project</a></li>
                <li><a href="#">Track project status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')"><i class="fas fa-graduation-cap"></i> Training Management</a>
            <ul id="training-dropdown" class="dropdown">
                <li><a href="#">Add/manage training programs</a></li>
                <li><a href="#">Assign employees to training</a></li>
                <li><a href="#">View training status</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'reports-dropdown')"><i class="fas fa-chart-bar"></i> Reports & Analytics</a>
            <ul id="reports-dropdown" class="dropdown">
                <li><a href="#">Generate reports of an employee</a></li>
                <li><a href="#">View department-wise performance metrics</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'role-dropdown')"><i class="fas fa-user-shield"></i> HR Management</a>
            <ul id="role-dropdown" class="dropdown">
                <li><a href='#'>View all HR's</a></li>
                <li><a href="#">Add or remove HR</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'audit-dropdown')"><i class="fas fa-file-alt"></i> Audits</a>
            <ul id="audit-dropdown" class="dropdown">
                <li><a href="#">Track audit logs</a></li>
            </ul>
        </li>
    </ul>
</div>