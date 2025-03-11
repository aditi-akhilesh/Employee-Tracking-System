function toggleDropdown(event, id) {
    event.preventDefault();
    const allDropdowns = document.querySelectorAll('.dropdown');
    allDropdowns.forEach(dropdown => {
        if (dropdown.id !== id) {
            dropdown.style.opacity = '0';
            setTimeout(() => dropdown.style.display = 'none', 200);
        }
    });
    const currentDropdown = document.getElementById(id);
    if (currentDropdown.style.display === 'block') {
        currentDropdown.style.opacity = '0';
        setTimeout(() => currentDropdown.style.display = 'none', 200);
    } else {
        currentDropdown.style.display = 'block';
        setTimeout(() => currentDropdown.style.opacity = '1', 10);
    }
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.sidebar')) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.style.opacity = '0';
            setTimeout(() => dropdown.style.display = 'none', 200);
        });
    }
});

function validateForm(event) {
    console.log("validateForm called");
    const dobInput = document.getElementById('dob');
    if (!dobInput || !dobInput.value) {
        console.error("DOB input not found or empty");
        alert("Please enter a valid date of birth.");
        event.preventDefault();
        return false;
    }

    const dobValue = new Date(dobInput.value);
    const currentDate = new Date();
    if (isNaN(dobValue.getTime())) {
        console.error("Invalid DOB value:", dobInput.value);
        alert("Please enter a valid date of birth.");
        event.preventDefault();
        return false;
    }

    let age = currentDate.getFullYear() - dobValue.getFullYear();
    const monthDiff = currentDate.getMonth() - dobValue.getMonth();
    const dayDiff = currentDate.getDate() - dobValue.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (age < 18) {
        console.log("Age validation failed: User is under 18");
        alert("You must be at least 18 years old.");
        event.preventDefault();
        return false;
    }

    const departmentInput = document.getElementById('department_id');
    if (!departmentInput || departmentInput.value === '') {
        console.log("Department validation failed: No department selected");
        alert('Please select a department');
        event.preventDefault();
        return false;
    }

    console.log("All validations passed");
    return true;
}

function showCreateUserForm() {
    console.log("showCreateUserForm called");
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Create New User</h2>
            <form action="../pages/features/create_user.php" method="POST" id="createUserForm">
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" required 
                           pattern="[A-Za-z ]+" 
                           title="First name must contain only letters and spaces" 
                           onkeypress="return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || event.charCode === 32">
                </div>
                <div class="form-group">
                    <label for="middle_name">Middle Name (Optional):</label>
                    <input type="text" id="middle_name" name="middle_name"
                           pattern="[A-Za-z]+"
                           title="Middle name must contain only letters"
                           onkeypress="return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122)">
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" required 
                           pattern="[A-Za-z ]+" 
                           title="Last name must contain only letters and spaces" 
                           onkeypress="return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || event.charCode === 32">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="phone_number">Phone Number:</label>
                    <input type="tel" id="phone_number" name="phone_number" pattern="[0-9]{10}" placeholder="1234567890" required>
                </div>
                <div class="form-group">
                    <label for="dob">Date of Birth:</label>
                    <input type="date" id="dob" name="dob" required>
                </div>
                <div class="form-group">
                    <label for="emp_hire_date">Hire Date:</label>
                    <input type="date" id="emp_hire_date" name="emp_hire_date" required>
                </div>
                <div class="form-group">
                    <label for="salary">Salary (Annual, in USD):</label>
                    <input type="number" id="salary" name="salary" required min="0.01" step="0.01" placeholder="50000.00">
                </div>
                <div class="form-group">
                    <label for="role">Role:</label>
                    <select id="role" name="role" required>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        <option value="">Select a department</option>
                        ${departments.map(dept => `<option value="${dept.department_id}">${dept.department_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Create User</button>
                    <button type="button" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
        `;
        const form = document.getElementById('createUserForm');
        if (form) {
            form.addEventListener('submit', validateForm);
        } else {
            console.error("createUserForm not found after rendering");
        }
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showWelcomeMessage() {
    console.log("showWelcomeMessage called");
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        profileUpdateForm.innerHTML = '';
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showAddProjectForm() {
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Add New Project</h2>
            <form action="../pages/features/manage_projects.php" method="POST" onsubmit="return validateProjectForm(this)">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label for="project_name">Project Name:</label>
                    <input type="text" id="project_name" name="project_name" required>
                </div>
                <div class="form-group">
                    <label for="start_date">Start Date:</label>
                    <input type="date" id="start_date" name="start_date" required>
                </div>
                <div class="form-group">
                    <label for="expected_end_date">Expected End Date:</label>
                    <input type="date" id="expected_end_date" name="expected_end_date" required>
                </div>
                <div class="form-group">
                    <label for="client_name">Client Name:</label>
                    <input type="text" id="client_name" name="client_name" required>
                </div>
                <div class="form-group">
                    <label for="client_contact_email">Client Contact Email:</label>
                    <input type="email" id="client_contact_email" name="client_contact_email" required>
                </div>
                <div class="form-group">
                    <label for="project_status">Project Status:</label>
                    <select id="project_status" name="project_status" required>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget">Budget ($):</label>
                    <input type="number" id="budget" name="budget" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        <option value="">Select a department</option>
                        ${departments.map(dept => `<option value="${dept.department_id}">${dept.department_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Add Project</button>
                    <button type="button" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
        `;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showProjectStatus() {
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        const ongoingProjects = projects.filter(p => p.project_status !== 'Completed');
        profileUpdateForm.innerHTML = `
            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Track Project Status</h2>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #f5f5f5; color: #333;">
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Project Name</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Status</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Department</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${ongoingProjects.length > 0 ? ongoingProjects.map(proj => `
                        <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9f9f9'" onmouseout="this.style.backgroundColor='#fff'">
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="cursor: pointer; color: #007bff;" onclick="showProjectDetails(${proj.project_id})">${proj.project_name}</span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #fff; display: inline-block;
                                    ${proj.project_status === 'In Progress' ? 'background-color: #28a745;' :
                                    proj.project_status === 'Not Started' ? 'background-color: #6c757d;' :
                                    'background-color: #ffc107;'}">
                                    ${proj.project_status}
                                </span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${departments.find(d => d.department_id == proj.department_id)?.department_name || 'N/A'}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <button style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                        onmouseover="this.style.backgroundColor='#0056b3'" 
                                        onmouseout="this.style.backgroundColor='#007bff'"
                                        onclick="showEditProjectForm(${proj.project_id})">Edit</button>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="padding: 20px; text-align: center; color: #666; border-bottom: 1px solid #eee;">No ongoing projects found.</td>
                        </tr>
                    `}
                </tbody>
            </table>
            <div class="form-group button-group" style="margin-top: 20px;">
                <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                        onmouseover="this.style.backgroundColor='#5a6268'" 
                        onmouseout="this.style.backgroundColor='#6c757d'"
                        onclick="showWelcomeMessage()">Back</button>
            </div>
            <div id="project-details" style="display: none; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></div>
        `;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showProjectDetails(projectId) {
    const proj = projects.find(p => p.project_id == projectId);
    if (!proj) {
        alert("Project not found!");
        return;
    }
    const detailsDiv = document.getElementById('project-details');
    if (detailsDiv) {
        detailsDiv.style.display = 'block';
        detailsDiv.innerHTML = `
            <h3 style="font-size: 20px; color: #333; margin-bottom: 15px;">${proj.project_name} Details</h3>
            <p><strong>Start Date:</strong> ${proj.start_date}</p>
            <p><strong>Expected End Date:</strong> ${proj.expected_end_date}</p>
            <p><strong>Actual End Date:</strong> ${proj.actual_end_date || 'N/A'}</p>
            <p><strong>Client Name:</strong> ${proj.client_name}</p>
            <p><strong>Client Contact Email:</strong> ${proj.client_contact_email}</p>
            <p><strong>Budget:</strong> $${parseFloat(proj.budget).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Actual Cost:</strong> ${proj.actual_cost ? '$' + parseFloat(proj.actual_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
            <button style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                    onmouseover="this.style.backgroundColor='#c82333'" 
                    onmouseout="this.style.backgroundColor='#dc3545'"
                    onclick="document.getElementById('project-details').style.display='none'">Close</button>
        `;
    }
}

function showEditProjectForm(projectId) {
    const proj = projects.find(p => p.project_id == projectId);
    if (!proj) {
        alert("Project not found!");
        return;
    }
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Edit Project</h2>
            <form action="../pages/features/manage_projects.php" method="POST" onsubmit="return validateProjectForm(this)">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="project_id" value="${proj.project_id}">
                <div class="form-group">
                    <label for="project_name">Project Name:</label>
                    <input type="text" id="project_name" name="project_name" value="${proj.project_name}" required>
                </div>
                <div class="form-group">
                    <label for="start_date">Start Date:</label>
                    <input type="date" id="start_date" name="start_date" value="${proj.start_date}" required>
                </div>
                <div class="form-group">
                    <label for="expected_end_date">Expected End Date:</label>
                    <input type="date" id="expected_end_date" name="expected_end_date" value="${proj.expected_end_date}" required>
                </div>
                <div class="form-group">
                    <label for="actual_end_date">Actual End Date (if completed):</label>
                    <input type="date" id="actual_end_date" name="actual_end_date" value="${proj.actual_end_date || ''}">
                </div>
                <div class="form-group">
                    <label for="client_name">Client Name:</label>
                    <input type="text" id="client_name" name="client_name" value="${proj.client_name}" required>
                </div>
                <div class="form-group">
                    <label for="client_contact_email">Client Contact Email:</label>
                    <input type="email" id="client_contact_email" name="client_contact_email" value="${proj.client_contact_email}" required>
                </div>
                <div class="form-group">
                    <label for="project_status">Project Status:</label>
                    <select id="project_status" name="project_status" required>
                        <option value="Not Started" ${proj.project_status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="In Progress" ${proj.project_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="On Hold" ${proj.project_status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        <option value="Completed" ${proj.project_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget">Budget ($):</label>
                    <input type="number" id="budget" name="budget" step="0.01" value="${proj.budget}" required>
                </div>
                <div class="form-group">
                    <label for="actual_cost">Actual Cost ($):</label>
                    <input type="number" id="actual_cost" name="actual_cost" step="0.01" value="${proj.actual_cost || ''}">
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        ${departments.map(dept => `<option value="${dept.department_id}" ${proj.department_id === dept.department_id ? 'selected' : ''}>${dept.department_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Update Project</button>
                    <button type="button" onclick="showProjectStatus()">Back</button>
                </div>
            </form>
        `;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function validateProjectForm(form) {
    const startDate = new Date(form.start_date.value);
    const expectedEndDate = new Date(form.expected_end_date.value);
    const actualEndDate = form.actual_end_date.value ? new Date(form.actual_end_date.value) : null;

    if (expectedEndDate < startDate) {
        alert("Expected End Date must be after Start Date.");
        return false;
    }
    if (actualEndDate && actualEndDate < startDate) {
        alert("Actual End Date must be after Start Date.");
        return false;
    }
    return true;
}

function showAllEmployees() {
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        let html = `
            <h2>All Employees/Managers</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #003087; color: #FFFFFF;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">Role</th>
                        <th style="padding: 10px;">Department</th>
                        <th style="padding: 10px;">Hire Date</th>
                        <th style="padding: 10px;">Salary</th>
                    </tr>
                </thead>
                <tbody>
        `;
        employees.forEach(emp => {
            const deptName = departments.find(d => d.department_id == emp.department_id)?.department_name || 'N/A';
            html += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${emp.employee_id}</td>
                    <td style="padding: 10px;">${emp.first_name} ${emp.last_name}</td>
                    <td style="padding: 10px;">${emp.email}</td>
                    <td style="padding: 10px;">${emp.role}</td>
                    <td style="padding: 10px;">${deptName}</td>
                    <td style="padding: 10px;">${emp.emp_hire_date}</td>
                    <td style="padding: 10px;">$${parseFloat(emp.salary).toFixed(2)}</td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;
        mainContent.innerHTML = html;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showUpdateRemoveUserForm() {
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        let html = `
            <h2>Update or Remove Employee</h2>
            <p>Select an employee to update or remove:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #003087; color: #FFFFFF;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        employees.forEach(emp => {
            html += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${emp.employee_id}</td>
                    <td style="padding: 10px;">${emp.first_name} ${emp.last_name}</td>
                    <td style="padding: 10px;">${emp.email}</td>
                    <td style="padding: 10px;">
                        <button onclick="showEmployeeUpdateForm(${emp.employee_id})" style="background-color: #007BFF; color: #FFFFFF; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;">Update</button>
                        <button onclick="removeEmployee(${emp.employee_id})" style="background-color: #dc3545; color: #FFFFFF; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">Remove</button>
                    </td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;
        mainContent.innerHTML = html;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function showEmployeeUpdateForm(employeeId) {
    const emp = employees.find(e => e.employee_id == employeeId);
    if (!emp) {
        alert('Employee not found!');
        return;
    }
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (mainContent && profileUpdateForm) {
        mainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        const deptOptions = departments.map(d => `
            <option value="${d.department_id}" ${d.department_id == emp.department_id ? 'selected' : ''}>
                ${d.department_name}
            </option>
        `).join('');
        profileUpdateForm.innerHTML = `
            <h2>Update Employee</h2>
            <form method="POST" action="../includes/update_employee.php">
                <input type="hidden" name="employee_id" value="${emp.employee_id}">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" value="${emp.first_name}" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" value="${emp.last_name}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${emp.email}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select name="role" required>
                        <option value="User" ${emp.role === 'User' ? 'selected' : ''}>User</option>
                        <option value="Manager" ${emp.role === 'Manager' ? 'selected' : ''}>Manager</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select name="department_id" required>
                        ${deptOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Hire Date</label>
                    <input type="date" name="emp_hire_date" value="${emp.emp_hire_date}" required>
                </div>
                <div class="form-group">
                    <label>Salary</label>
                    <input type="number" name="salary" value="${emp.salary}" step="0.01" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Save Changes</button>
                    <button type="button" onclick="showUpdateRemoveUserForm()">Back</button>
                </div>
            </form>
        `;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}

function removeEmployee(employeeId) {
    if (confirm('Are you sure you want to remove this employee?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '../includes/remove_employee.php';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'employee_id';
        input.value = employeeId;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }
}