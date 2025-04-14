function toggleDropdown(event, id) {
  event.preventDefault();
  const allDropdowns = document.querySelectorAll('.dropdown');
  allDropdowns.forEach((dropdown) => {
    if (dropdown.id !== id) {
      dropdown.style.opacity = '0';
      setTimeout(() => (dropdown.style.display = 'none'), 200);
    }
  });
  const currentDropdown = document.getElementById(id);
  if (currentDropdown.style.display === 'block') {
    currentDropdown.style.opacity = '0';
    setTimeout(() => (currentDropdown.style.display = 'none'), 200);
  } else {
    currentDropdown.style.display = 'block';
    setTimeout(() => (currentDropdown.style.opacity = '1'), 10);
  }
}

document.addEventListener('click', function (event) {
  if (!event.target.closest('.sidebar')) {
    document.querySelectorAll('.dropdown').forEach((dropdown) => {
      dropdown.style.opacity = '0';
      setTimeout(() => (dropdown.style.display = 'none'), 200);
    });
  }
});

function validateForm(event) {
  console.log('validateForm called');
  const dobInput = document.getElementById('dob');
  if (!dobInput || !dobInput.value) {
    console.error('DOB input not found or empty');
    alert('Please enter a valid date of birth.');
    event.preventDefault();
    return false;
  }

  const dobValue = new Date(dobInput.value);
  const currentDate = new Date();
  if (isNaN(dobValue.getTime())) {
    console.error('Invalid DOB value:', dobInput.value);
    alert('Please enter a valid date of birth.');
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
    console.log('Age validation failed: User is under 18');
    alert('You must be at least 18 years old.');
    event.preventDefault();
    return false;
  }

  const departmentInput = document.getElementById('department_id');
  if (!departmentInput || departmentInput.value === '') {
    console.log('Department validation failed: No department selected');
    alert('Please select a department');
    event.preventDefault();
    return false;
  }

  console.log('All validations passed');
  return true;
}

function showCreateUserForm() {
  console.log('showCreateUserForm called');
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';

    // Filter employees to get only managers for the "Assign to Manager" dropdown
    const managers = employees.filter(
      (emp) => emp.role === 'Manager' && emp.emp_status !== 'Inactive'
    );

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
                        <option value="">Select Role</option>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <div class="form-group" id="assign-manager-group" style="display: none;">
                    <label for="manager_id">Assign to Manager:</label>
                    <select id="manager_id" name="manager_id">
                        <option value="">Select a Manager</option>
                        ${managers
                          .map(
                            (manager) =>
                              `<option value="${manager.employee_id}" data-department-id="${manager.department_id}">${manager.first_name} ${manager.last_name} (ID: ${manager.employee_id})</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group" id="department-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required disabled>
                        <option value="">Select a department</option>
                        ${departments
                          .map(
                            (dept) =>
                              `<option value="${dept.department_id}">${dept.department_name}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Create User</button>
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        `;

    const form = document.getElementById('createUserForm');
    const roleSelect = document.getElementById('role');
    const assignManagerGroup = document.getElementById('assign-manager-group');
    const departmentGroup = document.getElementById('department-group');
    const departmentSelect = document.getElementById('department_id');
    const managerSelect = document.getElementById('manager_id');

    if (
      form &&
      roleSelect &&
      assignManagerGroup &&
      departmentGroup &&
      departmentSelect &&
      managerSelect
    ) {
      // Handle role selection
      roleSelect.addEventListener('change', function () {
        // Reset states
        assignManagerGroup.style.display = 'none';
        managerSelect.value = ''; // Reset manager selection
        departmentSelect.disabled = false; // Enable department by default

        if (this.value === 'User') {
          // Show "Assign to Manager" dropdown for User role
          assignManagerGroup.style.display = 'block';
          departmentSelect.disabled = true; // Disable department selection until a manager is selected
          departmentSelect.value = ''; // Reset department selection
        } else if (this.value === 'Manager') {
          // For Manager role, hide "Assign to Manager" and enable department selection
          assignManagerGroup.style.display = 'none';
          departmentSelect.disabled = false;
          departmentSelect.value = ''; // Reset department selection
        } else {
          // For "Select Role", hide "Assign to Manager" and disable department
          assignManagerGroup.style.display = 'none';
          departmentSelect.disabled = true;
          departmentSelect.value = ''; // Reset department selection
        }
      });

      // Handle manager selection to auto-set the department
      managerSelect.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const managerDepartmentId =
          selectedOption.getAttribute('data-department-id');
        if (managerDepartmentId) {
          departmentSelect.value = managerDepartmentId; // Set the department to the manager's department
          departmentSelect.disabled = true; // Keep department disabled
        } else {
          departmentSelect.value = ''; // Reset if no manager is selected
          departmentSelect.disabled = true;
        }
      });

      // Update validateForm to ensure department is set
      form.addEventListener('submit', function (event) {
        if (!validateForm(event)) {
          return false;
        }

        // Ensure department_id is set when role is User
        if (roleSelect.value === 'User' && !managerSelect.value) {
          alert('Please select a manager for the user.');
          event.preventDefault();
          return false;
        }

        // For User role, ensure department_id matches the manager's department
        if (roleSelect.value === 'User') {
          const selectedOption =
            managerSelect.options[managerSelect.selectedIndex];
          const managerDepartmentId =
            selectedOption.getAttribute('data-department-id');
          if (managerDepartmentId) {
            departmentSelect.value = managerDepartmentId; // Ensure department_id is set before submission
          }
        }
      });
    } else {
      console.error(
        'createUserForm, role select, assign-manager-group, department-group, department select, or manager select not found after rendering'
      );
    }
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

// dashboard.js

function showWelcomeMessage(event) {
    if (event) event.preventDefault();
    console.log("showWelcomeMessage called with event:", event);
    const mainContent = document.getElementById('main-content');
    const profileUpdateForm = document.getElementById('profile-update-form');
    console.log("mainContent:", mainContent, "profileUpdateForm:", profileUpdateForm);
    if (mainContent && profileUpdateForm) {
        console.log("Elements found, updating display");
        mainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        profileUpdateForm.innerHTML = '';
        // Reset main-content to welcome message
        mainContent.innerHTML = `
            <h2>Welcome, ${userName} (HR)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        `;
    } else {
        console.error("main-content or profile-update-form not found");
    }
}


function showAddProjectForm() {
  console.log('showAddProjectForm called');
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    // Reset both mainContent and profileUpdateForm to avoid overlap
    mainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    profileUpdateForm.innerHTML = ''; // Clear any previous content
    profileUpdateForm.innerHTML = `
            <h2 style="font-size: 24px; color: #007bff; margin-bottom: 20px;">Add New Project</h2>
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
                        ${departments
                          .map(
                            (dept) =>
                              `<option value="${dept.department_id}">${dept.department_name}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                    <button type="submit" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Add Project</button>
                    <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                            onmouseover="this.style.backgroundColor='#5a6268'" 
                            onmouseout="this.style.backgroundColor='#6c757d'"
                            onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        `;
  } else {
    console.error('main-content or profile-update-form not found');
  }
}
function showProjectStatus() {
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    const ongoingProjects = projects.filter(
      (p) => p.project_status !== 'Completed'
    );
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
                    ${
                      ongoingProjects.length > 0
                        ? ongoingProjects
                            .map(
                              (proj) => `
                        <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9f9f9'" onmouseout="this.style.backgroundColor='#fff'">
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="cursor: pointer; color: #007bff;" onclick="showProjectDetails(${
                                  proj.project_id
                                })">${proj.project_name}</span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #fff; display: inline-block;
                                    ${
                                      proj.project_status === 'In Progress'
                                        ? 'background-color: #28a745;'
                                        : proj.project_status === 'Not Started'
                                        ? 'background-color: #6c757d;'
                                        : 'background-color: #ffc107;'
                                    }">
                                    ${proj.project_status}
                                </span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              departments.find(
                                (d) => d.department_id == proj.department_id
                              )?.department_name || 'N/A'
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <button style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                        onmouseover="this.style.backgroundColor='#0056b3'" 
                                        onmouseout="this.style.backgroundColor='#007bff'"
                                        onclick="showEditProjectForm(${
                                          proj.project_id
                                        })">Edit</button>
                            </td>
                        </tr>
                    `
                            )
                            .join('')
                        : `
                        <tr>
                            <td colspan="4" style="padding: 20px; text-align: center; color: #666; border-bottom: 1px solid #eee;">No ongoing projects found.</td>
                        </tr>
                    `
                    }
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
    console.error('main-content or profile-update-form not found');
  }
}

function showProjectDetails(projectId) {
  const proj = projects.find((p) => p.project_id == projectId);
  if (!proj) {
    alert('Project not found!');
    return;
  }
  const detailsDiv = document.getElementById('project-details');
  if (detailsDiv) {
    detailsDiv.style.display = 'block';
    detailsDiv.innerHTML = `
            <h3 style="font-size: 20px; color: #333; margin-bottom: 15px;">${
              proj.project_name
            } Details</h3>
            <p><strong>Start Date:</strong> ${proj.start_date}</p>
            <p><strong>Expected End Date:</strong> ${proj.expected_end_date}</p>
            <p><strong>Actual End Date:</strong> ${
              proj.actual_end_date || 'N/A'
            }</p>
            <p><strong>Client Name:</strong> ${proj.client_name}</p>
            <p><strong>Client Contact Email:</strong> ${
              proj.client_contact_email
            }</p>
            <p><strong>Budget:</strong> $${parseFloat(
              proj.budget
            ).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</p>
            <p><strong>Actual Cost:</strong> ${
              proj.actual_cost
                ? '$' +
                  parseFloat(proj.actual_cost).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : 'N/A'
            }</p>
            <button style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                    onmouseover="this.style.backgroundColor='#c82333'" 
                    onmouseout="this.style.backgroundColor='#dc3545'"
                    onclick="document.getElementById('project-details').style.display='none'">Close</button>
        `;
  }
}

function showEditProjectForm(projectId) {
  const proj = projects.find((p) => p.project_id == projectId);
  if (!proj) {
    alert('Project not found!');
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
                <input type="hidden" name="project_id" value="${
                  proj.project_id
                }">
                <div class="form-group">
                    <label for="project_name">Project Name:</label>
                    <input type="text" id="project_name" name="project_name" value="${
                      proj.project_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="start_date">Start Date:</label>
                    <input type="date" id="start_date" name="start_date" value="${
                      proj.start_date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="expected_end_date">Expected End Date:</label>
                    <input type="date" id="expected_end_date" name="expected_end_date" value="${
                      proj.expected_end_date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="actual_end_date">Actual End Date (if completed):</label>
                    <input type="date" id="actual_end_date" name="actual_end_date" value="${
                      proj.actual_end_date || ''
                    }">
                </div>
                <div class="form-group">
                    <label for="client_name">Client Name:</label>
                    <input type="text" id="client_name" name="client_name" value="${
                      proj.client_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="client_contact_email">Client Contact Email:</label>
                    <input type="email" id="client_contact_email" name="client_contact_email" value="${
                      proj.client_contact_email
                    }" required>
                </div>
                <div class="form-group">
                    <label for="project_status">Project Status:</label>
                    <select id="project_status" name="project_status" required>
                        <option value="Not Started" ${
                          proj.project_status === 'Not Started'
                            ? 'selected'
                            : ''
                        }>Not Started</option>
                        <option value="In Progress" ${
                          proj.project_status === 'In Progress'
                            ? 'selected'
                            : ''
                        }>In Progress</option>
                        <option value="On Hold" ${
                          proj.project_status === 'On Hold' ? 'selected' : ''
                        }>On Hold</option>
                        <option value="Completed" ${
                          proj.project_status === 'Completed' ? 'selected' : ''
                        }>Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget">Budget ($):</label>
                    <input type="number" id="budget" name="budget" step="0.01" value="${
                      proj.budget
                    }" required>
                </div>
                <div class="form-group">
                    <label for="actual_cost">Actual Cost ($):</label>
                    <input type="number" id="actual_cost" name="actual_cost" step="0.01" value="${
                      proj.actual_cost || ''
                    }">
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        ${departments
                          .map(
                            (dept) =>
                              `<option value="${dept.department_id}" ${
                                proj.department_id === dept.department_id
                                  ? 'selected'
                                  : ''
                              }>${dept.department_name}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Update Project</button>
                    <button type="button" onclick="showProjectStatus()">Back</button>
                </div>
            </form>
        `;
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

function validateProjectForm(form) {
  const startDate = new Date(form.start_date.value);
  const expectedEndDate = new Date(form.expected_end_date.value);
  const actualEndDate = form.actual_end_date.value
    ? new Date(form.actual_end_date.value)
    : null;

  if (expectedEndDate < startDate) {
    alert('Expected End Date must be after Start Date.');
    return false;
  }
  if (actualEndDate && actualEndDate < startDate) {
    alert('Actual End Date must be after Start Date.');
    return false;
  }
  return true;
}

function showAllEmployees() {
  console.log('showAllEmployees called');
  console.log('Employees array:', employees);
  console.log('Departments array:', departments);

  // Check if employees and departments are defined and not empty
  if (!employees || !Array.isArray(employees) || employees.length === 0) {
    console.error('Employees array is empty or undefined');
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML =
        '<h2>All Employees/Managers</h2><p>No employees found.</p>';
    }
    return;
  }
  if (!departments || !Array.isArray(departments)) {
    console.warn(
      'Departments array is empty or undefined. Using default value.'
    );
    departments = [];
  }

  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';

    // State for pagination, search, sorting, and filtering
    let currentPage = 1;
    let recordsPerPage = 5; // Default to 5 records per page
    let searchQuery = '';
    let sortColumn = 'employee_id'; // Default sort by ID
    let sortDirection = 'asc'; // Default sort direction
    let filterDepartment = 'All'; // Default filter
    let filterRole = 'All'; // Default filter

    // Function to render the table
    function renderTable() {
      console.log(
        'Rendering table with currentPage:',
        currentPage,
        'recordsPerPage:',
        recordsPerPage
      );

      // Filter employees by role and status
      let filteredEmployees = employees.filter(
        (emp) =>
          (emp.role === 'User' || emp.role === 'Manager') &&
          emp.emp_status !== 'Inactive'
      );

      // Apply search filter
      if (searchQuery) {
        filteredEmployees = filteredEmployees.filter(
          (emp) =>
            `${emp.first_name} ${emp.last_name}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply department filter
      if (filterDepartment !== 'All') {
        filteredEmployees = filteredEmployees.filter((emp) => {
          const deptName =
            departments.find((d) => d.department_id == emp.department_id)
              ?.department_name || 'N/A';
          return deptName === filterDepartment;
        });
      }

      // Apply role filter
      if (filterRole !== 'All') {
        filteredEmployees = filteredEmployees.filter(
          (emp) => emp.role === filterRole
        );
      }

      // Sort employees
      filteredEmployees.sort((a, b) => {
        let valueA, valueB;
        if (sortColumn === 'name') {
          valueA = `${a.first_name} ${a.last_name}`.toLowerCase();
          valueB = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else if (sortColumn === 'email') {
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
        } else if (sortColumn === 'role') {
          valueA = a.role.toLowerCase();
          valueB = b.role.toLowerCase();
        } else if (sortColumn === 'department') {
          valueA = (
            departments.find((d) => d.department_id == a.department_id)
              ?.department_name || 'N/A'
          ).toLowerCase();
          valueB = (
            departments.find((d) => d.department_id == b.department_id)
              ?.department_name || 'N/A'
          ).toLowerCase();
        } else if (sortColumn === 'emp_hire_date') {
          valueA = new Date(a.emp_hire_date);
          valueB = new Date(b.emp_hire_date);
        } else if (sortColumn === 'salary') {
          valueA = isNaN(parseFloat(a.salary)) ? 0 : parseFloat(a.salary);
          valueB = isNaN(parseFloat(b.salary)) ? 0 : parseFloat(b.salary);
        } else {
          valueA = a.employee_id;
          valueB = b.employee_id;
        }

        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });

      // Pagination logic
      const totalRecords = filteredEmployees.length;
      const totalPages = Math.ceil(totalRecords / recordsPerPage);
      // Ensure currentPage is within valid range
      currentPage = Math.min(currentPage, totalPages);
      currentPage = Math.max(currentPage, 1);
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

      console.log('Pagination details:', {
        totalRecords,
        totalPages,
        currentPage,
        recordsPerPage,
        startIndex,
        endIndex,
        recordsOnPage: paginatedEmployees.length,
      });

      // Build the HTML
      let html = `
                <h2>All Employees/Managers</h2>
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <label>Show: </label>
                        <select id="records-per-page" style="padding: 5px; margin-right: 10px;">
                            <option value="5" ${
                              recordsPerPage === 5 ? 'selected' : ''
                            }>5</option>
                            <option value="10" ${
                              recordsPerPage === 10 ? 'selected' : ''
                            }>10</option>
                            <option value="15" ${
                              recordsPerPage === 15 ? 'selected' : ''
                            }>15</option>
                            <option value="20" ${
                              recordsPerPage === 20 ? 'selected' : ''
                            }>20</option>
                        </select>
                        <label>Department: </label>
                        <select id="filter-department" style="padding: 5px; margin-right: 10px;">
                            <option value="All">All</option>
                            ${departments
                              .map(
                                (dept) =>
                                  `<option value="${dept.department_name}" ${
                                    filterDepartment === dept.department_name
                                      ? 'selected'
                                      : ''
                                  }>${dept.department_name}</option>`
                              )
                              .join('')}
                        </select>
                        <label>Role: </label>
                        <select id="filter-role" style="padding: 5px;">
                            <option value="All">All</option>
                            <option value="User" ${
                              filterRole === 'User' ? 'selected' : ''
                            }>User</option>
                            <option value="Manager" ${
                              filterRole === 'Manager' ? 'selected' : ''
                            }>Manager</option>
                        </select>
                    </div>
                    <div>
                        <input type="text" id="search-input" placeholder="Search by name or email..." style="padding: 5px; width: 200px;" value="${searchQuery}">
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #003087; color: #FFFFFF;">
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('employee_id')">ID ${
                              sortColumn === 'employee_id'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('name')">Name ${
                              sortColumn === 'name'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('email')">Email ${
                              sortColumn === 'email'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('role')">Role ${
                              sortColumn === 'role'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('department')">Department ${
                              sortColumn === 'department'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('emp_hire_date')">Hire Date ${
                              sortColumn === 'emp_hire_date'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                            <th style="padding: 10px; cursor: pointer;" onclick="sortTable('salary')">Salary ${
                              sortColumn === 'salary'
                                ? sortDirection === 'asc'
                                  ? '<i class="fas fa-sort-up"></i>'
                                  : '<i class="fas fa-sort-down"></i>'
                                : ''
                            }</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

      // Add table rows
      paginatedEmployees.forEach((emp, index) => {
        const deptName =
          departments.find((d) => d.department_id == emp.department_id)
            ?.department_name || 'N/A';
        const salary = isNaN(parseFloat(emp.salary))
          ? 0
          : parseFloat(emp.salary);
        html += `
                    <tr style="border-bottom: 1px solid #ddd; background-color: ${
                      index % 2 === 0 ? '#f9f9f9' : '#ffffff'
                    }; cursor: pointer;" onclick="viewEmployee(${
          emp.employee_id
        })">
                        <td style="padding: 10px;">${emp.employee_id}</td>
                        <td style="padding: 10px;">${emp.first_name} ${
          emp.last_name
        }</td>
                        <td style="padding: 10px;">${emp.email}</td>
                        <td style="padding: 10px;">${emp.role}</td>
                        <td style="padding: 10px;">${deptName}</td>
                        <td style="padding: 10px;">${emp.emp_hire_date}</td>
                        <td style="padding: 10px;">$${salary.toFixed(2)}</td>
                    </tr>
                `;
      });

      html += `
                    </tbody>
                </table>
                <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        Showing ${startIndex + 1} to ${Math.min(
        endIndex,
        totalRecords
      )} of ${totalRecords} employees
                    </div>
                    <div>
                        <button style="padding: 5px 10px; margin: 0 5px; ${
                          currentPage === 1
                            ? 'background-color: #ccc; cursor: not-allowed;'
                            : ''
                        }" 
                                ${currentPage === 1 ? 'disabled' : ''} 
                                onclick="changePage(${
                                  currentPage - 1
                                })">Previous</button>
            `;

      // Add page numbers
      const maxPagesToShow = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        html += `
                    <button style="padding: 5px 10px; margin: 0 5px; ${
                      i === currentPage
                        ? 'background-color: #003087; color: white;'
                        : ''
                    }" 
                            onclick="changePage(${i})">${i}</button>
                `;
      }

      html += `
                        <button style="padding: 5px 10px; margin: 0 5px; ${
                          currentPage === totalPages
                            ? 'background-color: #ccc; cursor: not-allowed;'
                            : ''
                        }" 
                                ${currentPage === totalPages ? 'disabled' : ''} 
                                onclick="changePage(${
                                  currentPage + 1
                                })">Next</button>
                    </div>
                </div>
                <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                    <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                            onmouseover="this.style.backgroundColor='#5a6268'" 
                            onmouseout="this.style.backgroundColor='#6c757d'"
                            onclick="showWelcomeMessage()">Back</button>
                </div>
            `;

      mainContent.innerHTML = html;

      // Add event listeners for search, filters, and records per page
      const searchInput = document.getElementById('search-input');
      const filterDepartmentSelect =
        document.getElementById('filter-department');
      const filterRoleSelect = document.getElementById('filter-role');
      const recordsPerPageSelect = document.getElementById('records-per-page');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          currentPage = 1; // Reset to first page on search
          console.log('Search query updated:', searchQuery);
          renderTable();
        });
      } else {
        console.error('Search input not found');
      }

      if (filterDepartmentSelect) {
        filterDepartmentSelect.addEventListener('change', (e) => {
          filterDepartment = e.target.value;
          currentPage = 1; // Reset to first page on filter change
          console.log('Department filter updated:', filterDepartment);
          renderTable();
        });
      } else {
        console.error('Department filter not found');
      }

      if (filterRoleSelect) {
        filterRoleSelect.addEventListener('change', (e) => {
          filterRole = e.target.value;
          currentPage = 1; // Reset to first page on filter change
          console.log('Role filter updated:', filterRole);
          renderTable();
        });
      } else {
        console.error('Role filter not found');
      }

      if (recordsPerPageSelect) {
        recordsPerPageSelect.addEventListener('change', (e) => {
          recordsPerPage = parseInt(e.target.value, 10);
          currentPage = 1; // Reset to first page when changing records per page
          console.log('Records per page updated:', recordsPerPage);
          renderTable();
        });
      } else {
        console.error('Records per page select not found');
      }
    }

    // Function to change page
    window.changePage = function (page) {
      console.log('changePage called with page:', page);
      currentPage = page;
      renderTable();
    };

    // Function to sort table
    window.sortTable = function (column) {
      console.log('sortTable called with column:', column);
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
      renderTable();
    };

    // Placeholder function for row click
    window.viewEmployee = function (employeeId) {
      console.log(`View employee with ID: ${employeeId}`);
      // Add logic to view/edit employee details
    };

    // Initial render
    console.log('Initial render of table');
    renderTable();
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

function showUpdateRemoveUserForm() {
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';

    // Get the current filter value (if any) before re-rendering
    const roleFilter = document.getElementById('role-filter');
    const currentFilter = roleFilter ? roleFilter.value : 'All';

    // Debug: Log the employees array and their roles
    console.log('Employees array:', employees);
    console.log(
      'Roles in employees:',
      employees.map((emp) => emp.role)
    );

    // Initial HTML with filter dropdown
    let html = `
            <h2>Update or Remove User</h2>
            <p>Select a role to Filter:</p>
            <div style="margin-bottom: 20px;">
                <label for="role-filter">Filter by Role: </label>
                <select id="role-filter" style="padding: 5px; border-radius: 4px;">
                    <option value="All" ${
                      currentFilter === 'All' ? 'selected' : ''
                    }>All</option>
                    <option value="User" ${
                      currentFilter === 'User' ? 'selected' : ''
                    }>Employee</option>
                    <option value="Manager" ${
                      currentFilter === 'Manager' ? 'selected' : ''
                    }>Manager</option>
                </select>
            </div>
            <table id="employees-table" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #003087; color: #FFFFFF;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">Email</th>
                        <th style="padding: 10px;">Actions</th>
                    </tr>
                </thead>
                <tbody id="employees-table-body">
                </tbody>
            </table>
            <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                        onmouseover="this.style.backgroundColor='#5a6268'" 
                        onmouseout="this.style.backgroundColor='#6c757d'"
                        onclick="showWelcomeMessage()">Back</button>
            </div>
        `;

    mainContent.innerHTML = html;

    // Function to render the table based on the selected filter
    function renderEmployeesTable(filterRole) {
      const tableBody = document.getElementById('employees-table-body');
      if (!tableBody) return;

      // Normalize roles and filter employees
      let filteredEmployees = employees.filter((emp) => {
        const role = emp.role ? emp.role.trim().toLowerCase() : '';
        return (
          (role === 'user' || role === 'manager') &&
          emp.emp_status?.toLowerCase() !== 'inactive'
        );
      });

      if (filterRole === 'User') {
        filteredEmployees = filteredEmployees.filter(
          (emp) => emp.role.trim().toLowerCase() === 'user'
        );
      } else if (filterRole === 'Manager') {
        filteredEmployees = filteredEmployees.filter(
          (emp) => emp.role.trim().toLowerCase() === 'manager'
        );
      }

      // Debug: Log the filtered employees
      console.log('Filtered employees:', filteredEmployees);

      // Clear the table body
      tableBody.innerHTML = '';

      // Populate the table with filtered employees
      filteredEmployees.forEach((emp) => {
        const deptName =
          departments.find((d) => d.department_id == emp.department_id)
            ?.department_name || 'N/A';
        tableBody.innerHTML += `
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
    }

    // Initial render with the retained filter
    renderEmployeesTable(currentFilter);

    // Add event listener to the filter dropdown
    const newRoleFilter = document.getElementById('role-filter');
    if (newRoleFilter) {
      newRoleFilter.addEventListener('change', function () {
        renderEmployeesTable(this.value);
      });
    } else {
      console.error('Role filter dropdown not found');
    }
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

function showEmployeeUpdateForm(employeeId) {
  const emp = employees.find((e) => e.employee_id == employeeId);
  if (!emp) {
    alert('Employee not found!');
    return;
  }

  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';

    const salary =
      emp.salary !== undefined && emp.salary !== null
        ? parseFloat(emp.salary)
        : 0;
    const originalValues = {
      first_name: (emp.first_name || '').trim(),
      last_name: (emp.last_name || '').trim(),
      email: (emp.email || '').trim(),
      role: (emp.role || '').trim(),
      department_id: (emp.department_id || '').toString().trim(),
      emp_hire_date: (emp.emp_hire_date || '').trim(),
      salary: salary.toFixed(2),
      manager_id: (emp.manager_id || '').toString().trim(),
      is_manager: (emp.is_manager || '0').toString().trim(),
    };

    const managers = employees.filter(
      (emp) => emp.role === 'Manager' && emp.emp_status !== 'Inactive'
    );

    const deptOptions = departments
      .map(
        (d) => `
            <option value="${d.department_id}" ${
          d.department_id == emp.department_id ? 'selected' : ''
        }>
                ${d.department_name}
            </option>
        `
      )
      .join('');

    profileUpdateForm.innerHTML = `
            <h2>Update Employee</h2>
            <form method="POST" action="../pages/features/update_employee.php" id="updateUserForm">
                <input type="hidden" name="employee_id" value="${
                  emp.employee_id
                }">
                <input type="hidden" name="is_manager" value="${
                  emp.is_manager || '0'
                }">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" value="${
                      emp.first_name || ''
                    }" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" value="${
                      emp.last_name || ''
                    }" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${
                      emp.email || ''
                    }" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select name="role" id="role" required>
                        <option value="User" ${
                          emp.role === 'User' ? 'selected' : ''
                        }>User</option>
                        <option value="Manager" ${
                          emp.role === 'Manager' ? 'selected' : ''
                        }>Manager</option>
                    </select>
                </div>
                <div class="form-group" id="assign-manager-group" style="display: ${
                  emp.role === 'User' ? 'block' : 'none'
                };">
                    <label for="manager_id">Assign to Manager:</label>
                    <select id="manager_id" name="manager_id">
                        <option value="">Select a Manager</option>
                        ${managers
                          .map((manager) => {
                            const empManagerId = emp.manager_id
                              ? String(emp.manager_id).trim()
                              : '';
                            const managerEmployeeId = manager.employee_id
                              ? String(manager.employee_id).trim()
                              : '';
                            const isSelected =
                              empManagerId === managerEmployeeId;
                            return `<option value="${
                              manager.employee_id
                            }" data-department-id="${manager.department_id}" ${
                              isSelected ? 'selected' : ''
                            }>${manager.first_name} ${manager.last_name} (ID: ${
                              manager.employee_id
                            })</option>`;
                          })
                          .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select name="department_id" id="department_id" required ${
                      emp.role === 'User' ? 'disabled' : ''
                    }>
                        ${deptOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Hire Date</label>
                    <input type="date" name="emp_hire_date" value="${
                      emp.emp_hire_date || ''
                    }" required>
                </div>
                <div class="form-group">
                    <label>Salary</label>
                    <input type="number" name="salary" value="${salary.toFixed(
                      2
                    )}" step="0.01" required>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Save Changes</button>
                    <button type="button" onclick="showUpdateRemoveUserForm()">Back</button>
                </div>
            </form>
        `;

    const form = document.getElementById('updateUserForm');
    const roleSelect = document.getElementById('role');
    const assignManagerGroup = document.getElementById('assign-manager-group');
    const departmentSelect = document.getElementById('department_id');
    const managerSelect = document.getElementById('manager_id');

    if (
      form &&
      roleSelect &&
      assignManagerGroup &&
      departmentSelect &&
      managerSelect
    ) {
      roleSelect.addEventListener('change', function () {
        assignManagerGroup.style.display =
          this.value === 'User' ? 'block' : 'none';
        managerSelect.value =
          this.value === 'User' ? originalValues.manager_id : '';
        departmentSelect.disabled = this.value === 'User';
        departmentSelect.value = emp.department_id || '';
      });

      managerSelect.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const managerDepartmentId =
          selectedOption.getAttribute('data-department-id');
        if (managerDepartmentId) {
          departmentSelect.value = managerDepartmentId;
          departmentSelect.disabled = true;
        } else {
          departmentSelect.value = emp.department_id || '';
          departmentSelect.disabled = true;
        }
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const currentValues = {
          first_name: (formData.get('first_name') || '').trim(),
          last_name: (formData.get('last_name') || '').trim(),
          email: (formData.get('email') || '').trim(),
          role: (formData.get('role') || '').trim(),
          department_id: departmentSelect.disabled
            ? originalValues.department_id
            : (formData.get('department_id') || '').trim(),
          emp_hire_date: (formData.get('emp_hire_date') || '').trim(),
          salary: parseFloat(formData.get('salary') || '0').toFixed(2),
          manager_id: (formData.get('manager_id') || '').toString().trim(),
          is_manager: (formData.get('is_manager') || '0').toString().trim(),
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentValues.email)) {
          alert('Please enter a valid email address');
          return;
        }
        if (parseFloat(currentValues.salary) <= 0) {
          alert('Salary must be a positive number');
          return;
        }
        const today = new Date().toISOString().split('T')[0];
        if (currentValues.emp_hire_date > today) {
          alert('Hire date cannot be in the future');
          return;
        }

        let hasChanges = false;
        for (const key in originalValues) {
          const originalValue = String(originalValues[key]).trim();
          const currentValue = String(currentValues[key]).trim();
          if (originalValue !== currentValue) {
            hasChanges = true;
            break;
          }
        }

        if (!hasChanges) {
          alert('No changes detected');
          return;
        }

        // Check if changing from Manager to User and has subordinates
        if (
          originalValues.role === 'Manager' &&
          currentValues.role === 'User'
        ) {
          const subordinates = employees.filter(
            (e) =>
              e.manager_id &&
              String(e.manager_id).trim() === String(emp.employee_id).trim() &&
              e.employee_id !== emp.employee_id // Exclude self
          );
          if (subordinates.length > 0) {
            alert(
              'Cannot change role to User: This manager has ' +
                subordinates.length +
                ' employee(s) assigned.'
            );
            return;
          }
        }

        if (roleSelect.value === 'User') {
          if (!managerSelect.value) {
            alert('Please select a manager for the user.');
            return;
          }
          const selectedOption =
            managerSelect.options[managerSelect.selectedIndex];
          const managerDepartmentId =
            selectedOption.getAttribute('data-department-id');
          if (managerDepartmentId) {
            formData.set('department_id', managerDepartmentId);
          }
        } else {
          formData.set('manager_id', '');
          formData.set('is_manager', '1');
        }

        fetch(form.action, {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response
              .text()
              .then((text) => ({ text, headers: response.headers }));
          })
          .then(({ text, headers }) => {
            const contentType = headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Server returned non-JSON response');
            }
            const data = JSON.parse(text);
            if (data.success) {
              alert(data.message || 'Employee updated successfully');
              fetch(
                '../pages/features/fetch_employees.php?ts=' +
                  new Date().getTime(),
                {
                  method: 'GET',
                  headers: { 'Cache-Control': 'no-cache' },
                }
              )
                .then((response) => response.json())
                .then((updatedEmployees) => {
                  employees.length = 0;
                  updatedEmployees.forEach((emp) => employees.push(emp));
                  showUpdateRemoveUserForm();
                })
                .catch((error) => {
                  alert(
                    'Error fetching updated employee list: ' + error.message
                  );
                });
            } else {
              alert(data.message || data.error || 'Error updating employee');
            }
          })
          .catch((error) => {
            alert('Error updating employee: ' + error.message);
          });
      });
    } else {
      // Handle form elements not found
    }
  } else {
    // Handle main-content or profile-update-form not found
  }
}

function removeEmployee(employeeId) {
  // Show confirmation alert
  if (!confirm('Are you sure you want to deactivate this employee?')) {
    return; // If user clicks "Cancel", do nothing
  }

  // Find the employee in the employees array
  const employee = employees.find((emp) => emp.employee_id == employeeId);
  if (!employee) {
    alert('Employee not found in local data.');
    return;
  }

  // Check if the employee is a Manager with subordinates
  if (employee.role === 'Manager') {
    const subordinates = employees.filter(
      (e) =>
        e.manager_id &&
        String(e.manager_id).trim() === String(employeeId).trim() &&
        e.employee_id !== employeeId // Exclude self
    );
    if (subordinates.length > 0) {
      alert(
        `Cannot deactivate this manager: They have ${subordinates.length} employee(s) assigned.`
      );
      return;
    }
  }

  const formData = new FormData();
  formData.append('employee_id', employeeId);

  fetch('../pages/features/remove_employee.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return response.text().then((text) => {
          throw new Error(`Server returned non-JSON response: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert(data.message || 'Employee deactivated successfully');
        // Fetch the updated list of employees from the server
        fetch('../pages/features/fetch_employees.php')
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((updatedEmployees) => {
            employees.length = 0; // Clear the array
            updatedEmployees.forEach((emp) => employees.push(emp)); // Repopulate with updated data
            showUpdateRemoveUserForm();
          })
          .catch((error) => {
            // console.error('Error fetching updated employees:', error);
            alert('Error fetching updated employee list: ' + error.message);
            showUpdateRemoveUserForm();
          });
      } else {
        alert(data.error || 'Error deactivating employee');
      }
    })
    .catch((error) => {
      // console.error('Fetch error:', error);
      alert('Error deactivating employee: ' + error.message);
    });
}

function showDepartmentInfo() {
  console.log('showDepartmentInfo called');
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (mainContent && profileUpdateForm) {
    mainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';
    let html = `
            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Department Information</h2>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #003087; color: #FFFFFF;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Department ID</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Employee Count</th>
                    </tr>
                </thead>
                <tbody>
        `;
    if (departments.length > 0) {
      departments.forEach((dept) => {
        html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${
                          dept.department_id
                        }</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${
                          dept.department_name
                        }</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${
                          dept.department_description || 'No description'
                        }</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${
                          dept.employee_count
                        }</td>
                    </tr>
                `;
      });
    } else {
      html += `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center; color: #666;">No departments found.</td>
                </tr>
            `;
    }
    html += `
                </tbody>
            </table>
            <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                        onmouseover="this.style.backgroundColor='#5a6268'" 
                        onmouseout="this.style.backgroundColor='#6c757d'"
                        onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
    mainContent.innerHTML = html;
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

// Training Management Functions

function showAddTrainingForm() {
  const contentArea = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (contentArea && profileUpdateForm) {
    const welcomeHeading = contentArea.querySelector('h2');
    const welcomeMessage = contentArea.querySelector('p');
    if (welcomeHeading) welcomeHeading.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    const departmentMap = new Map(
      departments.map((d) => [d.department_id, d.department_name])
    );

    profileUpdateForm.style.display = 'block';
    profileUpdateForm.innerHTML = `
            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Manage Training Programs</h2>
            <h3 style="font-size: 18px; color: #555;">Add New Training</h3>
            <form action="../pages/features/manage_training.php" method="POST" onsubmit="return validateTrainingForm(this)">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label for="training_name">Training Name:</label>
                    <input type="text" id="training_name" name="training_name" required>
                </div>
                <div class="form-group">
                    <label for="training_date">Start Date:</label>
                    <input type="date" id="training_date" name="training_date" required>
                </div>
                <div class="form-group">
                    <label for="end_date">End Date:</label>
                    <input type="date" id="end_date" name="end_date" required>
                </div>
                <div class="form-group">
                    <label for="certificate">Certificate:</label>
                    <input type="text" id="certificate" name="certificate" required>
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        <option value="">Select a department</option>
                        ${departments
                          .map(
                            (dept) =>
                              `<option value="${dept.department_id}">${dept.department_name}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Add Training</button>
                    <button type="button" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
            <h3 style="font-size: 18px; color: #555; margin-top: 30px;">Existing Training Programs</h3>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #f5f5f5; color: #333;">
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Training Name</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Start Date</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">End Date</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Department</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      trainings.length > 0
                        ? trainings
                            .map(
                              (training) => `
                        <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9f9f9'" onmouseout="this.style.backgroundColor='#fff'">
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              training.training_name
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              training.training_date
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              training.end_date
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              departmentMap.get(training.department_id) ||
                              training.department_id
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <button style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                        onmouseover="this.style.backgroundColor='#0056b3'" 
                                        onmouseout="this.style.backgroundColor='#007bff'"
                                        onclick="showEditTrainingForm(${
                                          training.training_id
                                        })">Edit</button>
                                <button style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                        onmouseover="this.style.backgroundColor='#c82333'" 
                                        onmouseout="this.style.backgroundColor='#dc3545'"
                                        onclick="deleteTraining(${
                                          training.training_id
                                        })">Delete</button>
                            </td>
                        </tr>
                    `
                            )
                            .join('')
                        : `
                        <tr>
                            <td colspan="5" style="padding: 20px; text-align: center; color: #666; border-bottom: 1px solid #eee;">No training programs found.</td>
                        </tr>
                    `
                    }
                </tbody>
            </table>
        `;
  } else {
    console.error('content-area or profile-update-form not found');
  }
}

function showEditTrainingForm(trainingId) {
  const training = trainings.find((t) => t.training_id == trainingId);
  if (!training) {
    alert('Training not found!');
    return;
  }
  const contentArea = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (contentArea && profileUpdateForm) {
    const welcomeHeading = contentArea.querySelector('h2');
    const welcomeMessage = contentArea.querySelector('p');
    if (welcomeHeading) welcomeHeading.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    profileUpdateForm.style.display = 'block';
    profileUpdateForm.innerHTML = `
            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Edit Training Program</h2>
            <form action="../pages/features/manage_training.php" method="POST" onsubmit="return validateTrainingForm(this)">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="training_id" value="${
                  training.training_id
                }">
                <div class="form-group">
                    <label for="training_name">Training Name:</label>
                    <input type="text" id="training_name" name="training_name" value="${
                      training.training_name
                    }" required>
                </div>
                <div class="form-group">
                    <label for="training_date">Start Date:</label>
                    <input type="date" id="training_date" name="training_date" value="${
                      training.training_date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="end_date">End Date:</label>
                    <input type="date" id="end_date" name="end_date" value="${
                      training.end_date
                    }" required>
                </div>
                <div class="form-group">
                    <label for="certificate">Certificate:</label>
                    <input type="text" id="certificate" name="certificate" value="${
                      training.certificate
                    }" required>
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        <option value="">Select a department</option>
                        ${departments
                          .map(
                            (dept) =>
                              `<option value="${dept.department_id}" ${
                                training.department_id === dept.department_id
                                  ? 'selected'
                                  : ''
                              }>${dept.department_name}</option>`
                          )
                          .join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Update Training</button>
                    <button type="button" onclick="showAddTrainingForm()">Back</button>
                </div>
            </form>
        `;
  }
}

function deleteTraining(trainingId) {
  if (confirm('Are you sure you want to delete this training program?')) {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('training_id', trainingId);
    fetch('../pages/features/manage_training.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          trainings = trainings.filter((t) => t.training_id != trainingId);
          showAddTrainingForm();
        } else {
          alert(data.error);
        }
      });
  }
}

function validateTrainingForm(form) {
  const startDate = new Date(form.training_date.value);
  const endDate = new Date(form.end_date.value);
  if (endDate < startDate) {
    alert('End Date must be after Start Date.');
    return false;
  }
  return true;
}
// Helper function for navigation
function navigateToForm(contentAreaId, formAreaId, formContent, backFunction) {
  const contentArea = document.getElementById(contentAreaId);
  const formArea = document.getElementById(formAreaId);
  if (contentArea && formArea) {
    const welcomeHeading = contentArea.querySelector('h2');
    const welcomeMessage = contentArea.querySelector('p');
    if (welcomeHeading) welcomeHeading.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    formArea.style.display = 'block';
    formArea.innerHTML = formContent;

    // Add event listener to the "Back" button dynamically
    const backButton = formArea.querySelector(
      '.button-group button[type="button"]'
    );
    if (backButton) {
      backButton.onclick = (event) => {
        event.preventDefault();
        if (backFunction) backFunction();
        else showWelcomeMessage(event);
      };
    }
  } else {
    console.error(`${contentAreaId} or ${formAreaId} not found`);
  }
}

// Updated showWelcomeMessage to work with content-area
function showWelcomeMessage(event) {
  if (event) event.preventDefault();
  console.log('showWelcomeMessage called with event:', event);
  const contentArea = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  console.log(
    'contentArea:',
    contentArea,
    'profileUpdateForm:',
    profileUpdateForm
  );
  if (contentArea && profileUpdateForm) {
    console.log('Elements found, updating display');
    contentArea.querySelector('h2').style.display = 'block';
    contentArea.querySelector('p').style.display = 'block';
    profileUpdateForm.style.display = 'none';
    profileUpdateForm.innerHTML = '';
  } else {
    console.error('content-area or profile-update-form not found');
  }
}

// Training Management Functions

function showAddTrainingForm() {
  console.log('showAddTrainingForm called');
  const departmentMap = new Map(
    departments.map((d) => [d.department_id, d.department_name])
  );
  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Manage Training Programs</h2>
        <h3 style="font-size: 18px; color: #555;">Add New Training</h3>
        <form action="../pages/features/manage_training.php" method="POST" onsubmit="return validateTrainingForm(this)">
            <input type="hidden" name="action" value="add">
            <div class="form-group">
                <label for="training_name">Training Name:</label>
                <input type="text" id="training_name" name="training_name" required>
            </div>
            <div class="form-group">
                <label for="training_date">Start Date:</label>
                <input type="date" id="training_date" name="training_date" required>
            </div>
            <div class="form-group">
                <label for="end_date">End Date:</label>
                <input type="date" id="end_date" name="end_date" required>
            </div>
            <div class="form-group">
                <label for="certificate">Certificate:</label>
                <input type="text" id="certificate" name="certificate" required>
            </div>
            <div class="form-group">
                <label for="department_id">Department:</label>
                <select id="department_id" name="department_id" required>
                    <option value="">Select a department</option>
                    ${departments
                      .map(
                        (dept) =>
                          `<option value="${dept.department_id}">${dept.department_name}</option>`
                      )
                      .join('')}
                </select>
            </div>
            <div class="form-group button-group">
                <button type="submit">Add Training</button>
                <button type="button">Back</button>
            </div>
        </form>
        <h3 style="font-size: 18px; color: #555; margin-top: 30px;">Existing Training Programs</h3>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background-color: #f5f5f5; color: #333;">
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Training Name</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Start Date</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">End Date</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Department</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${
                  trainings.length > 0
                    ? trainings
                        .map(
                          (training) => `
                    <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9f9f9'" onmouseout="this.style.backgroundColor='#fff'">
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                          training.training_name
                        }</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                          training.training_date
                        }</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                          training.end_date
                        }</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                          departmentMap.get(training.department_id) ||
                          training.department_id
                        }</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">
                            <button style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                    onmouseover="this.style.backgroundColor='#0056b3'" 
                                    onmouseout="this.style.backgroundColor='#007bff'"
                                    onclick="showEditTrainingForm(${
                                      training.training_id
                                    })">Edit</button>
                            <button style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                                    onmouseover="this.style.backgroundColor='#c82333'" 
                                    onmouseout="this.style.backgroundColor='#dc3545'"
                                    onclick="deleteTraining(${
                                      training.training_id
                                    })">Delete</button>
                        </td>
                    </tr>
                `
                        )
                        .join('')
                    : `
                    <tr>
                        <td colspan="5" style="padding: 20px; text-align: center; color: #666; border-bottom: 1px solid #eee;">No training programs found.</td>
                    </tr>
                `
                }
            </tbody>
        </table>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showWelcomeMessage
  );
}

function showEditTrainingForm(trainingId) {
  console.log('showEditTrainingForm called for trainingId:', trainingId);
  const training = trainings.find((t) => t.training_id == trainingId);
  if (!training) {
    alert('Training not found!');
    return;
  }

  // Store original values for comparison
  const originalValues = {
    training_name: training.training_name,
    training_date: training.training_date,
    end_date: training.end_date,
    certificate: training.certificate,
    department_id: training.department_id,
  };

  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Edit Training Program</h2>
        <form action="../pages/features/manage_training.php" method="POST" onsubmit="return handleTrainingUpdate(event, this, ${JSON.stringify(
          originalValues
        )})">
            <input type="hidden" name="action" value="edit">
            <input type="hidden" name="training_id" value="${
              training.training_id
            }">
            <div class="form-group">
                <label for="training_name">Training Name:</label>
                <input type="text" id="training_name" name="training_name" value="${
                  training.training_name
                }" required>
            </div>
            <div class="form-group">
                <label for="training_date">Start Date:</label>
                <input type="date" id="training_date" name="training_date" value="${
                  training.training_date
                }" required>
            </div>
            <div class="form-group">
                <label for="end_date">End Date:</label>
                <input type="date" id="end_date" name="end_date" value="${
                  training.end_date
                }" required>
            </div>
            <div class="form-group">
                <label for="certificate">Certificate:</label>
                <input type="text" id="certificate" name="certificate" value="${
                  training.certificate
                }" required>
            </div>
            <div class="form-group">
                <label for="department_id">Department:</label>
                <select id="department_id" name="department_id" required>
                    <option value="">Select a department</option>
                    ${departments
                      .map(
                        (dept) =>
                          `<option value="${dept.department_id}" ${
                            training.department_id === dept.department_id
                              ? 'selected'
                              : ''
                          }>${dept.department_name}</option>`
                      )
                      .join('')}
                </select>
            </div>
            <div class="form-group button-group">
                <button type="submit">Update Training</button>
                <button type="button">Back</button>
            </div>
        </form>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showAddTrainingForm
  );
}

function handleTrainingUpdate(event, form, originalValues) {
  event.preventDefault();

  // Get current form values
  const formData = new FormData(form);
  const currentValues = {
    training_name: formData.get('training_name'),
    training_date: formData.get('training_date'),
    end_date: formData.get('end_date'),
    certificate: formData.get('certificate'),
    department_id: formData.get('department_id'),
  };

  // Compare values
  const hasChanges = Object.keys(originalValues).some(
    (key) => originalValues[key] !== currentValues[key]
  );

  if (!hasChanges) {
    alert('No changes detected. Training remains unchanged.');
    showAddTrainingForm();
    return false;
  }

  // Validate dates if there are changes
  if (!validateTrainingForm(form)) {
    return false;
  }

  // Submit if there are changes
  fetch(form.action, {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        // Update local trainings array
        const index = trainings.findIndex(
          (t) => t.training_id == formData.get('training_id')
        );
        if (index !== -1) {
          trainings[index] = {
            ...trainings[index],
            ...currentValues,
          };
        }
        showAddTrainingForm();
      } else {
        alert(data.error);
      }
    })
    .catch((error) => {
      alert('Error updating training: ' + error.message);
    });

  return false; // Prevent default form submission
}

function deleteTraining(trainingId) {
  if (confirm('Are you sure you want to delete this training program?')) {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('training_id', trainingId);
    fetch('../pages/features/manage_training.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          trainings = trainings.filter((t) => t.training_id != trainingId);
          showAddTrainingForm();
        } else {
          alert(data.error);
        }
      });
  }
}

function validateTrainingForm(form) {
  const startDate = new Date(form.training_date.value);
  const endDate = new Date(form.end_date.value);
  if (endDate < startDate) {
    alert('End Date must be after Start Date.');
    return false;
  }
  return true;
}

// Updated showWelcomeMessage to work with main-content
function showWelcomeMessage(event) {
  if (event) event.preventDefault();
  console.log('showWelcomeMessage called with event:', event);
  const mainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  console.log(
    'mainContent:',
    mainContent,
    'profileUpdateForm:',
    profileUpdateForm
  );
  if (mainContent && profileUpdateForm) {
    console.log('Elements found, updating display');
    mainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';
    profileUpdateForm.innerHTML = '';
    // Reset main-content to welcome message
    mainContent.innerHTML = `
            <h2>Welcome, ${userName} (HR)</h2>
            <p>Select an option from the menu on the left to get started.</p>
        `;
  } else {
    console.error('main-content or profile-update-form not found');
  }
}

// Updated Training Management Functions

function showAssignTraining(event) {
  if (event) event.preventDefault();
  console.log('showAssignTraining called');
  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Assign Training to Employees</h2>
        <form action="../pages/features/manage_training.php" method="POST">
            <input type="hidden" name="action" value="assign">
            <div class="form-group">
                <label for="training_id">Training Program:</label>
                <select id="training_id" name="training_id" required onchange="showAssignedEmployees(this.value)">
                    <option value="">Select a training program</option>
                    ${trainings
                      .map(
                        (training) =>
                          `<option value="${training.training_id}">${training.training_name}</option>`
                      )
                      .join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="employee_id">Employee:</label>
                <select id="employee_id" name="employee_id" required>
                    <option value="">Select an employee</option>
                    ${employees
                      .map(
                        (emp) =>
                          `<option value="${emp.employee_id}">${emp.employee_id} - ${emp.first_name} ${emp.last_name} (Dept: ${emp.department_id})</option>`
                      )
                      .join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="enrollment_date">Enrollment Date:</label>
                <input type="date" id="enrollment_date" name="enrollment_date" required>
            </div>
            <div class="form-group button-group">
                <button type="submit">Assign Training</button>
                <button type="button">Back</button>
            </div>
        </form>
        <div id="assigned-employees" style="margin-top: 20px;">
            <h3 style="font-size: 18px; color: #555;">Assigned Employees</h3>
            <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #f5f5f5; color: #333;">
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Employee</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Enrollment Date</th>
                        <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Action</th>
                    </tr>
                </thead>
                <tbody id="assigned-employees-table">
                    <tr>
                        <td colspan="3" style="padding: 20px; text-align: center; color: #666;">Select a training program to view assigned employees.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showWelcomeMessage
  );
}

function showAssignEmployees() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById(
    'project-assignments-section'
  );

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'block';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

    const form = document.getElementById('assign-employees-form');
    if (!form) {
      console.error('Assign employees form not found!');
      return;
    }

    // Remove existing submit event listeners to prevent duplication
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(event) {
      event.preventDefault();
      console.log('Submitting assign-employees-form...');
      fetch('../pages/features/manage_assignments.php', {
        method: 'POST',
        body: new FormData(this),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Response from manage_assignments.php:', data);
          if (data.success) {
            console.log('Assignment successful, showing success message...');
            showSuccess('Employee assigned to project successfully!');
            form.reset();
          } else {
            console.error('Assignment failed:', data.error);
            showError(
              data.error || 'Failed to assign employee',
              'assign-employees-section'
            );
          }
        })
        .catch((error) => {
          console.error('Network error:', error);
          showError(
            'Network error: ' + error.message,
            'assign-employees-section'
          );
        });
    }
  } else {
    console.error('Required DOM elements not found:', {
      mainContent,
      profileUpdateForm,
      innerMainContent,
      reportsAnalytics,
      projectsSection,
      assignEmployeesSection,
      subtasksSection,
      projectAssignmentsSection,
    });
  }
}

function removeEmployeeTraining(employeeTrainingId) {
  if (
    confirm('Are you sure you want to remove this employee from the training?')
  ) {
    const formData = new FormData();
    formData.append('action', 'remove_assignment');
    formData.append('employee_training_id', employeeTrainingId);
    fetch('../pages/features/manage_training.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          employeeTrainings = employeeTrainings.filter(
            (et) => et.employee_training_id != employeeTrainingId
          );
          const selectedTraining = document.getElementById('training_id').value;
          showAssignedEmployees(selectedTraining);
        } else {
          alert(data.error);
        }
      });
  }
}

function showTrainingStatus(event) {
  if (event) event.preventDefault();
  console.log('showTrainingStatus called');
  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">View Training Status</h2>
        <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background-color: #f5f5f5; color: #333;">
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Employee</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Training Program</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Enrollment Date</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Status</th>
                    <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #ddd;">Score</th>
                </tr>
            </thead>
            <tbody>
                ${
                  employeeTrainings.length > 0
                    ? employeeTrainings
                        .map((et) => {
                          const training = trainings.find(
                            (t) => t.training_id == et.training_id
                          );
                          return `
                        <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f9f9f9'" onmouseout="this.style.backgroundColor='#fff'">
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              et.first_name
                            } ${et.last_name} (ID: ${et.employee_id})</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              training ? training.training_name : 'Unknown'
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
                              et.enrollment_date || 'N/A'
                            }</td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #fff; display: inline-block;
                                    ${
                                      et.completion_status === 'In Progress'
                                        ? 'background-color: #28a745;'
                                        : et.completion_status === 'Not Started'
                                        ? 'background-color: #6c757d;'
                                        : 'background-color: #007bff;'
                                    }">
                                    ${et.completion_status || 'N/A'}
                                </span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <span style="padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #fff;
                                    ${
                                      et.score >= 80
                                        ? 'background-color: #28a745;'
                                        : et.score >= 50
                                        ? 'background-color: #ffc107;'
                                        : 'background-color: #dc3545;'
                                    }">
                                    ${et.score !== null ? et.score : 'N/A'}
                                </span>
                            </td>
                        </tr>
                    `;
                        })
                        .join('')
                    : `
                    <tr>
                        <td colspan="5" style="padding: 20px; text-align: center; color: #666; border-bottom: 1px solid #eee;">No training assignments found.</td>
                    </tr>
                `
                }
            </tbody>
        </table>
        <div class="form-group button-group" style="margin-top: 20px;">
            <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                    onmouseover="this.style.backgroundColor='#5a6268'" 
                    onmouseout="this.style.backgroundColor='#6c757d'">Back</button>
        </div>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showWelcomeMessage
  );
}

// Helper function for navigation (already defined in your code)
function navigateToForm(contentAreaId, formAreaId, formContent, backFunction) {
  const contentArea = document.getElementById(contentAreaId);
  const formArea = document.getElementById(formAreaId);
  const mainContent = document.getElementById('main-content');
  if (contentArea && formArea && mainContent) {
    mainContent.style.display = 'none';
    formArea.style.display = 'block';
    formArea.innerHTML = formContent;

    const backButton = formArea.querySelector(
      '.button-group button[type="button"]'
    );
    if (backButton) {
      backButton.onclick = (event) => {
        event.preventDefault();
        if (backFunction) backFunction(event);
        else showWelcomeMessage(event);
      };
    }
  } else {
    console.error(`${contentAreaId}, ${formAreaId}, or main-content not found`);
  }
}

// Attendance Records (updated to attach event listener after form creation)
function showAttendanceRecords(event) {
  if (event) event.preventDefault();
  console.log('showAttendanceRecords called');
  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Attendance Records</h2>
        <form id="attendanceForm" onsubmit="event.preventDefault(); updateAttendanceTable()">
            <div class="form-group">
                <label for="employee_id">Employee ID:</label>
                <input type="text" id="employee_id" name="employee_id">
            </div>
            <div class="form-group">
                <label for="start_date">Start Date:</label>
                <input type="date" id="start_date" name="start_date">
            </div>
            <div class="form-group">
                <label for="end_date">End Date:</label>
                <input type="date" id="end_date" name="end_date">
            </div>
            <div class="form-group button-group">
                <button type="submit">Search Attendance</button>
                <button type="button">Back</button>
            </div>
        </form>
        <div style="margin-top: 20px;">
            <table id="attendanceTable" style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #003087; color: #fff;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Employee ID</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Department</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Check In</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Check Out</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="6">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showWelcomeMessage
  );

  // Attach the event listener to attendanceForm after it's added to the DOM
  const searchForm = document.getElementById('attendanceForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      updateAttendanceTable();
    });
  } else {
    console.warn('attendanceForm not found after rendering');
  }

  updateAttendanceTable(); // Initial load
}

function updateAttendanceTable() {
  const employeeId = document.getElementById('employee_id')?.value || '';
  const startDate = document.getElementById('start_date')?.value || '';
  const endDate = document.getElementById('end_date')?.value || '';
  const attendanceTable = document.getElementById('attendanceTable');
  if (attendanceTable) {
    attendanceTable.querySelector('tbody').innerHTML =
      '<tr><td colspan="6">Loading...</td></tr>';
  }

  fetch('hr_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=fetch_attendance&employee_id=${encodeURIComponent(
      employeeId
    )}&start_date=${encodeURIComponent(
      startDate
    )}&end_date=${encodeURIComponent(endDate)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Attendance data received:', data);
      if (attendanceTable && data.success) {
        attendanceTable.querySelector('tbody').innerHTML = `
                    ${
                      data.attendance_records.length > 0
                        ? data.attendance_records
                            .map(
                              (record) => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.employee_id
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.employee_name
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.department_name
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.check_in || 'N/A'
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.check_out || 'N/A'
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              record.status
                            }</td>
                        </tr>
                    `
                            )
                            .join('')
                        : '<tr><td colspan="6">No attendance records found.</td></tr>'
                    }
                `;
      } else {
        console.error('Error updating attendance table:', data.error);
        if (attendanceTable) {
          attendanceTable.querySelector('tbody').innerHTML =
            '<tr><td colspan="6">Error fetching data: ' +
            (data.error || 'Unknown error') +
            '</td></tr>';
        }
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      if (attendanceTable) {
        attendanceTable.querySelector('tbody').innerHTML =
          '<tr><td colspan="6">Network error: Unable to fetch data</td></tr>';
      }
    });
}

function showLeaveRequests(event) {
  if (event) event.preventDefault();
  console.log('showLeaveRequests called');
  const formContent = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Leave Requests</h2>
        <div class="form-group">
            <label for="leaveFilter">Filter by Status:</label>
            <select id="leaveFilter" onchange="updateLeaveTable()">
                <option value="ispending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
        <div style="margin-top: 20px;">
            <table id="leaveTable" style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background-color: #003087; color: #fff;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Request ID</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Employee Name</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Start Date</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">End Date</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="6">Loading...</td></tr>
                </tbody>
            </table>
        </div>
        <div class="form-group button-group" style="margin-top: 20px;">
            <button type="button">Back</button>
        </div>
    `;
  navigateToForm(
    'content-area',
    'profile-update-form',
    formContent,
    showWelcomeMessage
  );

  // Attach the event listener to leaveFilter after it's added to the DOM
  const leaveFilter = document.getElementById('leaveFilter');
  if (leaveFilter) {
    leaveFilter.addEventListener('change', function (event) {
      event.preventDefault();
      updateLeaveTable();
    });
  }

  updateLeaveTable(); // Initial load
}

function updateLeaveTable() {
  const leaveFilter =
    document.getElementById('leaveFilter')?.value || 'ispending';
  const leaveTable = document.getElementById('leaveTable');
  if (leaveTable) {
    leaveTable.querySelector('tbody').innerHTML =
      '<tr><td colspan="6">Loading...</td></tr>';
  }

  fetch('hr_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=fetch_leave_applications&leave_filter=${encodeURIComponent(
      leaveFilter
    )}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Leave data received:', data);
      if (leaveTable && data.success) {
        leaveTable.querySelector('tbody').innerHTML = `
                    ${
                      data.leave_applications.length > 0
                        ? data.leave_applications
                            .map(
                              (app) => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              app.request_id
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              app.employee_name
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              app.leave_start_date
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${
                              app.leave_end_date || 'N/A'
                            }</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">
                                <span class="status-badge ${
                                  app.status === 'ispending'
                                    ? 'status-pending'
                                    : app.status === 'approved'
                                    ? 'status-approved'
                                    : 'status-rejected'
                                }">
                                    ${app.status}
                                </span>
                            </td>
                            <td style="padding: 10px; border: 1px solid #ddd;">
                                ${
                                  app.status === 'ispending'
                                    ? `
                                    <form class="action-form" onsubmit="updateLeaveStatus(event, ${app.request_id})">
                                        <input type="hidden" name="request_id" value="${app.request_id}">
                                        <select name="status">
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                        </select>
                                        <input type="submit" value="Update">
                                    </form>
                                `
                                    : app.status === 'approved' ||
                                      app.status === 'rejected'
                                    ? `
                                    <button class="reconsider-btn" onclick="reconsiderLeave(${app.request_id})">Reconsider</button>
                                `
                                    : ''
                                }
                            </td>
                        </tr>
                    `
                            )
                            .join('')
                        : '<tr><td colspan="6">No leave applications found for the selected status.</td></tr>'
                    }
                `;
      } else {
        console.error('Error updating leave table:', data.error);
        if (leaveTable) {
          leaveTable.querySelector('tbody').innerHTML =
            '<tr><td colspan="6">Error fetching data: ' +
            (data.error || 'Unknown error') +
            '</td></tr>';
        }
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      if (leaveTable) {
        leaveTable.querySelector('tbody').innerHTML =
          '<tr><td colspan="6">Network error: Unable to fetch data</td></tr>';
      }
    });
}
function reconsiderLeave(requestId) {
  if (
    confirm('Are you sure you want to move this application back to pending?')
  ) {
    fetch('hr_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=reconsider_leave&request_id=${encodeURIComponent(
        requestId
      )}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          updateLeaveTable();
        } else {
          alert(
            'Error reconsidering leave application: ' +
              (data.error || 'Unknown error')
          );
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        alert('Network error: Unable to reconsider leave application.');
      });
  }
}

function updateLeaveStatus(event, requestId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  formData.append('action', 'update_leave_status');
  formData.append('request_id', requestId);

  fetch('hr_dashboard.php', {
    method: 'POST',
    body: new URLSearchParams(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        updateLeaveTable();
      } else {
        alert(
          'Error updating leave status: ' + (data.error || 'Unknown error')
        );
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      alert('Network error: Unable to update leave status.');
    });
}
