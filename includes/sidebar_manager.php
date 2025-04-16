<div class="sidebar" style="background: #003087; width: 250px; padding: 20px; color: #fff; box-shadow: 2px 0 5px rgba(0,0,0,0.1);">
    <ul style="list-style: none; padding: 0;">
        <li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-users" style="margin-right: 10px;"></i> Manage Users</a>
            <ul id="manage-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showProfileForm()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Employees assigned to me</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-clock" style="margin-right: 10px;"></i> Attendance and Leave</a>
            <ul id="attendance-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showAttendanceRecords()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">View attendance records</a></li>
                <li><a href="#" onclick="showLeaveRequests()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Approve/reject leave requests</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'department-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-building" style="margin-right: 10px;"></i> Department Management</a>
            <ul id="department-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showDepartment()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Track department information</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'project-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-tasks" style="margin-right: 10px;"></i> Projects and Tasks</a>
            <ul id="project-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showProjects()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">View Project Status</a></li>
                <li><a href="#" onclick="showAssignEmployees()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Assign Employees to Project</a></li>
                <li><a href="#" onclick="showAssignedEmployeesSection()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">View/Edit Project Assignments</a></li>
                <li><a href="#" onclick="showSubtasks()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Create/Update Subtasks</a></li>            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'feedback-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-comment" style="margin-right: 10px;"></i> Feedback and Exit interview</a>
            <ul id="feedback-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showFeedbackForm()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Give feedback to employees</a></li>
                <li><a href="#" onclick="showFeedbackHistory()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">View employee feedback history</a></li>
                <li><a href="#" onclick="addexitinterview()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Request exit interview to the employee</a></li>
                <li><a href="#" onclick="updateExitInterview()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">update exit interview</a></li>
            </ul>
        </li>
        <li><a href="#" onclick="toggleDropdown(event, 'reports-dropdown')" style="display: flex; align-items: center; padding: 15px; color: #fff; text-decoration: none; border-radius: 6px; transition: background 0.3s;"><i class="fas fa-chart-bar" style="margin-right: 10px;"></i> Reports & Analytics</a>
            <ul id="reports-dropdown" class="dropdown" style="display: none; padding-left: 20px;">
                <li><a href="#" onclick="showReportsAnalytics()" style="padding: 10px; color: #ddd; text-decoration: none; display: block; transition: color 0.3s;">Generate reports of an employee</a></li>
            </ul>
        </li>
    </ul>
</div>
<script>
function toggleDropdown(event, dropdownId) {
    event.preventDefault();
    const dropdown = document.getElementById(dropdownId);
    const isDisplayed = dropdown.style.display === 'block';
    document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    dropdown.style.display = isDisplayed ? 'none' : 'block';
    
    // Add hover effect for sidebar items
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('mouseover', () => link.style.background = '#00205b');
        link.addEventListener('mouseout', () => link.style.background = '');
    });
    const dropdownLinks = document.querySelectorAll('.dropdown a');
    dropdownLinks.forEach(link => {
        link.addEventListener('mouseover', () => link.style.color = '#fff');
        link.addEventListener('mouseout', () => link.style.color = '#ddd');
    });
}
</script>