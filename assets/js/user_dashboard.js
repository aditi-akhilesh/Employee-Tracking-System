
// Utility function to show a section and hide others
function showSection(sectionId) {
  const sections = [
    'main-content',
    'projects-tasks-section',
    'salary-details-section',
    'mark-attendance-section',
    'attendance-history-section',
    'apply-leave-section',
    'track-leave-section',
    'faqs-section',
    'hr-contact-section',
    'profile-update-form' // Add this
  ];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      section.style.display = id === sectionId ? 'block' : 'none';
    }
  });
}
// Show welcome message (default view)
function showWelcomeMessage() {
  showSection('main-content');
}

// Toggle dropdown visibility
function toggleDropdown(event, dropdownId) {
  event.preventDefault();
  const dropdown = document.getElementById(dropdownId);
  const isDisplayed = dropdown.style.display === 'block';
  document.querySelectorAll('.dropdown').forEach((d) => {
    d.style.display = 'none';
    d.style.opacity = '0'; // Reset opacity when hidden
  });
  dropdown.style.display = isDisplayed ? 'none' : 'block';
  dropdown.style.opacity = isDisplayed ? '0' : '1'; // Sync opacity with display
}

function formatStatus(status) {
  const statusMap = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
  };
  return statusMap[status] || status; // Return formatted status or original if not in map
}

// Show Projects and Tasks section
function showProjectsTasks() {
  showSection('projects-tasks-section');
  fetchProjects();
  fetchTasks();
  fetchPerformanceMetrics();
}

// Fetch and display projects
function fetchProjects() {
  const tableBody = document.getElementById('projects-table-body');
  const projectFilter = document.getElementById('task_project_filter');

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_projects',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = ''; // Clear existing rows
      projectFilter.innerHTML = '<option value="">All Projects</option>'; // Reset filter

      if (data.success && data.projects.length > 0) {
        data.projects.forEach((project) => {
          const progress =
            project.total_tasks > 0
              ? Math.round(
                  (project.completed_tasks / project.total_tasks) * 100
                )
              : 0;
          const row = document.createElement('tr');
          row.innerHTML = `
                  <td>${project.project_name}</td>
                  <td>${project.start_date}</td>
                  <td>${project.expected_end_date}</td>
                  <td><span class="status-badge status-${project.project_status.toLowerCase()}">${
            project.project_status
          }</span></td>
                  <td>
                      <div style="background: #e9ecef; border-radius: 5px; height: 20px; width: 100%;">
                          <div style="background: #4caf50; width: ${progress}%; height: 100%; border-radius: 5px;"></div>
                      </div>
                      ${progress}%
                  </td>
              `;
          tableBody.appendChild(row);

          // Populate project filter
          const option = document.createElement('option');
          option.value = project.project_id;
          option.textContent = project.project_name;
          projectFilter.appendChild(option);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="5">No projects assigned.</td></tr>';
      }
    })
    .catch((error) => {
      console.error('Error fetching projects:', error);
      tableBody.innerHTML =
        '<tr><td colspan="5">Error fetching projects.</td></tr>';
    });
}

// Fetch and display tasks
function fetchTasks() {
  const sortBy = document.getElementById('task_sort_by').value;
  const sortOrder = document.getElementById('task_sort_order').value;
  const projectId = document.getElementById('task_project_filter').value;
  const tableBody = document.getElementById('tasks-table-body');
  console.log(
    'Fetching tasks with sortBy:',
    sortBy,
    'sortOrder:',
    sortOrder,
    'projectId:',
    projectId
  );

  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_tasks',
      sort_by: sortBy,
      sort_order: sortOrder,
      project_id: projectId,
    }),
  })
    .then((response) => {
      console.log('Tasks response status:', response.status);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('Tasks data:', data);
      tableBody.innerHTML = ''; // Clear existing rows
      if (data.success && data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((task) => {
          const formattedStatus = formatStatus(task.status); // Format the status for display
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${task.task_description}</td>
            <td>${task.project_name}</td>
            <td>${task.due_date || 'N/A'}</td>
            <td><span class="status-badge status-${task.status
              .toLowerCase()
              .replace(' ', '-')}"">${formattedStatus}</span></td>
            <td>
              <select onchange="updateTaskStatus(${task.task_id}, this.value)">
                <option value="not_started" ${
                  task.status === 'not_started' ? 'selected' : ''
                }>Not Started</option>
                <option value="in_progress" ${
                  task.status === 'in_progress' ? 'selected' : ''
                }>In Progress</option>
                <option value="completed" ${
                  task.status === 'completed' ? 'selected' : ''
                }>Completed</option>
                <option value="blocked" ${
                  task.status === 'blocked' ? 'selected' : ''
                }>Blocked</option>
              </select>
            </td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="5">No tasks assigned.</td></tr>';
      }
    })
    .catch((error) => {
      console.error('Error fetching tasks:', error);
      tableBody.innerHTML =
        '<tr><td colspan="5">Error fetching tasks: ' +
        error.message +
        '</td></tr>';
    });
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'update_task_status',
      task_id: taskId,
      new_status: newStatus,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        fetchTasks(); // Refresh task list
        fetchPerformanceMetrics(); // Update metrics
      } else {
        alert('Error: ' + (data.error || 'Failed to update task status'));
      }
    })
    .catch((error) => {
      console.error('Error updating task status:', error);
      alert('An error occurred while updating task status.');
    });
}

// Fetch and display performance metrics
function fetchPerformanceMetrics() {
  const totalTasksSpan = document.getElementById('total-tasks');
  const completedTasksSpan = document.getElementById('completed-tasks');
  const onTimeRateSpan = document.getElementById('on-time-rate');

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_performance_metrics',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.metrics) {
        totalTasksSpan.textContent = data.metrics.total_tasks;
        completedTasksSpan.textContent = data.metrics.completed_tasks;
        onTimeRateSpan.textContent = data.metrics.on_time_rate + '%';
      } else {
        totalTasksSpan.textContent = '0';
        completedTasksSpan.textContent = '0';
        onTimeRateSpan.textContent = '0%';
      }
    })
    .catch((error) => {
      console.error('Error fetching performance metrics:', error);
      totalTasksSpan.textContent = '0';
      completedTasksSpan.textContent = '0';
      onTimeRateSpan.textContent = '0%';
    });
}

// Show mark attendance form
function showMarkAttendanceForm() {
  showSection('mark-attendance-section');
  const form = document.getElementById('mark-attendance-form');
  form.reset(); // Reset the form when showing
  form.removeEventListener('submit', handleMarkAttendanceSubmit);
  form.addEventListener('submit', handleMarkAttendanceSubmit);
}

function handleMarkAttendanceSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('mark-attendance-form');
  const checkIn = document.getElementById('check_in').value;
  const checkOut = document.getElementById('check_out').value;
  const status = document.getElementById('status').value;

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'mark_attendance',
      check_in: checkIn,
      check_out: checkOut,
      status: status,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        form.reset();
      } else {
        alert('Error: ' + (data.error || 'Failed to mark attendance'));
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while marking attendance.');
    });
}

// Show attendance history
function showAttendanceHistory() {
  showSection('attendance-history-section');
  fetchAttendanceHistory();
}

// Fetch and display attendance history
function fetchAttendanceHistory() {
  const startDate = document.getElementById('attendance_start_date').value;
  const endDate = document.getElementById('attendance_end_date').value;
  const tableBody = document.getElementById('attendance-history-table');

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_attendance',
      start_date: startDate,
      end_date: endDate,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = ''; // Clear existing rows
      if (data.success && data.attendance_records.length > 0) {
        data.attendance_records.forEach((record) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                    <td>${record.check_in || 'N/A'}</td>
                    <td>${record.check_out || 'N/A'}</td>
                    <td>${record.status}</td>
                `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="3">No attendance records found.</td></tr>';
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      tableBody.innerHTML =
        '<tr><td colspan="3">Error fetching attendance history.</td></tr>';
    });
}

// Fetch and display leave balance
function fetchLeaveBalance() {
  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_leave_balance',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.leave_balances) {
        // Update the leave type dropdown
        const leaveTypeSelect = document.getElementById('leave_type_id');
        const options = leaveTypeSelect.options;
        for (let i = 1; i < options.length; i++) {
          // Start from 1 to skip the "Select a leave type" option
          const leaveTypeId = options[i].value;
          const balance = data.leave_balances.find(
            (b) => b.leave_type_id == leaveTypeId
          );
          if (balance) {
            options[
              i
            ].text = `${balance.leave_name} (Remaining: ${balance.remaining_days} days)`;
          }
        }

        // Update the leave balance summary table
        const tableBody = document.getElementById('leave-balance-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        data.leave_balances.forEach((balance) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                    <td>${balance.leave_name}</td>
                    <td>${balance.total_days_allocated}</td>
                    <td>${balance.days_used}</td>
                    <td>${balance.remaining_days}</td>
                `;
          tableBody.appendChild(row);
        });
      } else {
        console.error(
          'Failed to fetch leave balance:',
          data.error || 'Unknown error'
        );
      }
    })
    .catch((error) => {
      console.error('Error fetching leave balance:', error);
    });
}

// Show apply for leave form
function showApplyLeaveForm() {
  showSection('apply-leave-section');
  const form = document.getElementById('apply-leave-form');
  form.reset(); // Reset the form when showing
  form.removeEventListener('submit', handleApplyLeaveSubmit);
  form.addEventListener('submit', handleApplyLeaveSubmit);

  // Fetch the latest leave balance when showing the form
  fetchLeaveBalance();
}

function handleApplyLeaveSubmit(event) {
  event.preventDefault(); // Prevent default form submission
  const leaveTypeId = document.getElementById('leave_type_id').value;
  const startDate = document.getElementById('leave_start_date').value;
  const endDate = document.getElementById('leave_end_date').value;

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'apply_leave',
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        form.reset(); // Reset the form
        fetchLeaveBalance(); // Refresh leave balance after submission
        showTrackLeaveRequests(); // Redirect to Track Leave Requests section
      } else {
        alert('Error: ' + (data.error || 'Failed to apply for leave'));
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while applying for leave.');
    });
}

// Show track leave requests
function showTrackLeaveRequests() {
  showSection('track-leave-section');
  fetchLeaveRequests();
}

// Fetch and display leave requests
function fetchLeaveRequests() {
  const leaveFilter = document.getElementById('leave_filter').value;
  const tableBody = document.getElementById('leave-requests-table');

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_leave_requests',
      leave_filter: leaveFilter,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = ''; // Clear existing rows
      if (data.success && data.leave_requests.length > 0) {
        data.leave_requests.forEach((request) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                    <td>${request.leave_name}</td>
                    <td>${request.leave_start_date}</td>
                    <td>${request.leave_end_date}</td>
                    <td><span class="status-badge status-${request.status.toLowerCase()}">${
            request.status
          }</span></td>
                `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="4">No leave requests found.</td></tr>';
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      tableBody.innerHTML =
        '<tr><td colspan="4">Error fetching leave requests.</td></tr>';
    });
}

// Show FAQs section
function showFAQs() {
  showSection('faqs-section');
}

// Show HR Contact section
function showHRContact() {
  showSection('hr-contact-section');
}

// Placeholder for showProfileForm
function showProfileForm() {
  showSection('profile-update-form');
}

// Ensure functions are globally accessible and add hover effects
document.addEventListener('DOMContentLoaded', function () {
  window.toggleDropdown = toggleDropdown;
  window.showWelcomeMessage = showWelcomeMessage;
  window.showMarkAttendanceForm = showMarkAttendanceForm;
  window.showAttendanceHistory = showAttendanceHistory;
  window.showApplyLeaveForm = showApplyLeaveForm;
  window.showTrackLeaveRequests = showTrackLeaveRequests;
  window.fetchAttendanceHistory = fetchAttendanceHistory;
  window.fetchLeaveRequests = fetchLeaveRequests;
  window.showProfileForm = showProfileForm;
  window.showFAQs = showFAQs;
  window.showHRContact = showHRContact;
  window.showProjectsTasks = showProjectsTasks;
  window.showSalaryDetails = showSalaryDetails;

  // Add hover effects for sidebar items (matching manager dashboard)
  const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
  sidebarLinks.forEach((link) => {
    link.addEventListener(
      'mouseover',
      () => (link.style.background = '#00205b')
    );
    link.addEventListener('mouseout', () => (link.style.background = ''));
  });
  const dropdownLinks = document.querySelectorAll('.dropdown a');
  dropdownLinks.forEach((link) => {
    link.addEventListener('mouseover', () => (link.style.color = '#fff'));
    link.addEventListener('mouseout', () => (link.style.color = '#ddd'));
  });
});

// user_dashboard.js (update showProfileForm)

function showProfileForm() {
  // Use the profile-update-form div instead of content-area
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (!profileUpdateForm) {
    console.error('Profile update form container not found');
    return;
  }

  // Show the profile-update-form section and hide others
  showSection('profile-update-form');

  fetch('../pages/features/fetch_user_details.php')
    .then(response => {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers.get('Content-Type'));
      return response.text().then(text => {
        console.log('Raw response:', text);
        try {
          const data = JSON.parse(text);
          return { response, data };
        } catch (error) {
          throw new Error('Response is not valid JSON: ' + text);
        }
      });
    })
    .then(({ response, data }) => {
      if (data.error) {
        if (data.error === 'Not authenticated') {
          profileUpdateForm.innerHTML = `
            <div class="card">
              <h2>Profile Details</h2>
              <p style="color: #ff0000;">You are not authenticated. Please log in.</p>
              <div class="form-group button-group">
                <button type="button" onclick="window.location.href='../pages/login.php'">Log In</button>
              </div>
            </div>
          `;
        } else {
          profileUpdateForm.innerHTML = `
            <div class="card">
              <h2>Profile Details</h2>
              <p style="color: #ff0000;">${data.error}</p>
              <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage()">Back</button>
              </div>
            </div>
          `;
        }
        return;
      }

      // Render the form in view mode (read-only) with two fields side by side
      profileUpdateForm.innerHTML = `
        <div class="card">
          <h2>Profile Details</h2>
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label for="employee_id">Employee ID:</label>
                <input type="text" id="employee_id" name="employee_id" value="${data.employee_id}" readonly>
              </div>
              <div class="form-group">
                <label for="department_id">Department ID:</label>
                <input type="text" id="department_id" name="department_id" value="${data.department_id || ''}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="manager_id">Manager ID:</label>
                <input type="text" id="manager_id" name="manager_id" value="${data.manager_id || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="first_name">First Name:</label>
                <input type="text" id="first_name" name="first_name" value="${data.first_name}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="middle_name">Middle Name:</label>
                <input type="text" id="middle_name" name="middle_name" value="${data.middle_name || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="last_name">Last Name:</label>
                <input type="text" id="last_name" name="last_name" value="${data.last_name}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${data.email || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="phone_number">Phone Number:</label>
                <input type="tel" id="phone_number" name="phone_number" value="${data.phone_number || ''}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" name="dob" value="${data.dob || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="emp_hire_date">Hire Date:</label>
                <input type="date" id="emp_hire_date" name="emp_hire_date" value="${data.emp_hire_date || ''}" readonly>
              </div>
            </div>
            <div class="form-group">
              <label>Emergency Contacts:</label>
              <div id="emergency_contacts">
                ${
                  data.emergency_contacts && data.emergency_contacts.length > 0
                    ? data.emergency_contacts.map((contact, index) => `
                        <div class="emergency-contact" data-index="${index}">
                          <p><strong>Contact ${index + 1}:</strong></p>
                          <p>Name: <span class="contact-name">${contact.contact_name || ''}</span></p>
                          <p>Phone: <span class="contact-phone">${contact.contact_phone || ''}</span></p>
                          <p>Relationship: <span class="contact-relationship">${contact.relationship || ''}</span></p>
                        </div>
                      `).join('')
                    : '<p>No emergency contacts available.</p>'
                }
              </div>
            </div>
            <div class="form-group button-group">
              <button type="button" id="editProfileBtn">Edit Profile</button>
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </form>
        </div>
      `;

      // Add event listener for the Edit button
      const editProfileBtn = document.getElementById('editProfileBtn');
      const form = document.getElementById('profileForm');

      if (editProfileBtn && form) {
        editProfileBtn.addEventListener('click', function() {
          // Toggle to edit mode
          form.querySelectorAll('input, textarea').forEach(field => {
            if (['email', 'phone_number', 'dob'].includes(field.id)) {
              field.removeAttribute('readonly');
            }
          });

          // Replace emergency contacts with editable fields
          const emergencyContactsDiv = document.getElementById('emergency_contacts');
          emergencyContactsDiv.innerHTML = `
            <div id="emergency_contacts_list">
              ${
                data.emergency_contacts && data.emergency_contacts.length > 0
                  ? data.emergency_contacts.map((contact, index) => `
                      <div class="emergency-contact" data-index="${index}">
                        <p><strong>Contact ${index + 1}:</strong></p>
                        <div class="form-group">
                          <label for="contact_name_${index}">Name:</label>
                          <input type="text" id="contact_name_${index}" name="emergency_contacts[${index}][contact_name]" value="${contact.contact_name || ''}">
                        </div>
                        <div class="form-group">
                          <label for="contact_phone_${index}">Phone:</label>
                          <input type="tel" id="contact_phone_${index}" name="emergency_contacts[${index}][contact_phone]" value="${contact.contact_phone || ''}" pattern="[0-9]{10}" placeholder="1234567890">
                        </div>
                        <div class="form-group">
                          <label for="relationship_${index}">Relationship:</label>
                          <input type="text" id="relationship_${index}" name="emergency_contacts[${index}][relationship]" value="${contact.relationship || ''}">
                        </div>
                        <button type="button" class="remove-contact-btn" data-index="${index}">Remove Contact</button>
                      </div>
                    `).join('')
                  : '<p>No emergency contacts available.</p>'
              }
            </div>
            <button type="button" id="add_contact_btn">Add Emergency Contact</button>
          `;

          // Add event listener for adding new emergency contacts
          const addContactBtn = document.getElementById('add_contact_btn');
          if (addContactBtn) {
            addContactBtn.addEventListener('click', function() {
              const contactList = document.getElementById('emergency_contacts_list');
              const index = document.querySelectorAll('.emergency-contact').length;
              const newContactHTML = `
                <div class="emergency-contact" data-index="${index}">
                  <p><strong>Contact ${index + 1}:</strong></p>
                  <div class="form-group">
                    <label for="contact_name_${index}">Name:</label>
                    <input type="text" id="contact_name_${index}" name="emergency_contacts[${index}][contact_name]" value="">
                  </div>
                  <div class="form-group">
                    <label for="contact_phone_${index}">Phone:</label>
                    <input type="tel" id="contact_phone_${index}" name="emergency_contacts[${index}][contact_phone]" value="" pattern="[0-9]{10}" placeholder="1234567890">
                  </div>
                  <div class="form-group">
                    <label for="relationship_${index}">Relationship:</label>
                    <input type="text" id="relationship_${index}" name="emergency_contacts[${index}][relationship]" value="">
                  </div>
                  <button type="button" class="remove-contact-btn" data-index="${index}">Remove Contact</button>
                </div>
              `;
              contactList.insertAdjacentHTML('beforeend', newContactHTML);
              addRemoveContactListeners();
            });
          }

          // Add event listeners for removing contacts
          function addRemoveContactListeners() {
            document.querySelectorAll('.remove-contact-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                document.querySelector(`.emergency-contact[data-index="${index}"]`).remove();
              });
            });
          }
          addRemoveContactListeners();

          // Change the button to Save and Cancel
          editProfileBtn.outerHTML = `
            <button type="submit" id="saveProfileBtn">Save Changes</button>
            <button type="button" id="cancelEditBtn">Cancel</button>
          `;

          // Add event listener for Cancel button
          const cancelEditBtn = document.getElementById('cancelEditBtn');
          if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
              showProfileForm(); // Reload the form in view mode
            });
          }
        });

        // Add event listener for form submission with DOB validation
        form.addEventListener('submit', function(event) {
          event.preventDefault();

          // Validate DOB (must be 18 years or older)
          const dobmanduInput = document.getElementById('dob');
          if (dobInput && dobInput.value) {
            const dobValue = new Date(dobInput.value);
            const currentDate = new Date();
            if (isNaN(dobValue.getTime())) {
              alert('Please enter a valid date of birth.');
              return;
            }

            let age = currentDate.getFullYear() - dobValue.getFullYear();
            const monthDiff = currentDate.getMonth() - dobValue.getMonth();
            const dayDiff = currentDate.getDate() - dobValue.getDate();
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
              age--;
            }

            if (age < 18) {
              alert('You must be at least 18 years old.');
              return;
            }
          }

          const formData = new FormData(this);

          fetch('../pages/features/update_user_details.php', {
            method: 'POST',
            body: formData,
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              alert(result.message);
              showProfileForm(); // Reload the form with updated data
            } else {
              alert(result.error || 'Failed to update profile');
            }
          })
          .catch(error => alert('Network error: ' + error.message));
        });
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      profileUpdateForm.innerHTML = `
        <div class="card">
          <h2>Profile Details</h2>
          <p style="color: #ff0000;">Error fetching profile details: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </div>
      `;
    });
}


// user_dashboard.js (update showUpdatePasswordForm)

function showUpdatePasswordForm() {
  console.log('showUpdatePasswordForm called');
  // Use the profile-update-form div instead of content-area
  const profileUpdateForm = document.getElementById('profile-update-form');
  console.log('profile-update-form element:', profileUpdateForm);
  if (!profileUpdateForm) {
    console.error('Profile update form container not found');
    return;
  }

  // Show the profile-update-form section and hide others
  showSection('profile-update-form');

  profileUpdateForm.innerHTML = `
    <div class="card">
      <h2>Update Password</h2>
      <p style="color: #555; margin-bottom: 15px;">
        Password must be at least 12 characters long and include:
        <ul style="margin-top: 5px; padding-left: 20px; font-size: 14px; color: #6C757D;">
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one number (0-9)</li>
          <li>At least one special character (!@#$%^&*)</li>
          <li>No repetitive patterns (e.g., "aaaa", "1234")</li>
          <li>No common words (e.g., "password", "admin")</li>
        </ul>
      </p>
      <form id="updatePasswordForm">
        <div class="form-row">
          <div class="form-group">
            <label for="new_password">New Password:</label>
            <input type="password" id="new_password" name="new_password" required>
          </div>
          <div class="form-group">
            <label for="confirm_password">Confirm Password:</label>
            <input type="password" id="confirm_password" name="confirm_password" required>
          </div>
        </div>
        <div class="form-group">
          <div style="display: flex; align-items: center; margin-top: 15px; margin-bottom: 20px;">
            <input type="checkbox" id="showPassword" style="margin-right: 15px; width: 16px; height: 16px; cursor: pointer; vertical-align: middle; position: relative; top: -1px;">
            <label for="showPassword" style="font-weight: normal; color: #007bff; margin: 0; font-size: 14px; cursor: pointer; line-height: 1;">Show Password</label>
          </div>
        </div>
        <div class="form-group button-group">
          <button type="submit" id="savePasswordBtn">Save</button>
          <button type="button" onclick="showWelcomeMessage()">Back</button>
        </div>
      </form>
    </div>
  `;
  console.log('Update Password form rendered in profile-update-form');

  // Add event listener for the Show Password checkbox
  const showPasswordCheckbox = document.getElementById('showPassword');
  const newPasswordInput = document.getElementById('new_password');
  const confirmPasswordInput = document.getElementById('confirm_password');

  if (showPasswordCheckbox && newPasswordInput && confirmPasswordInput) {
    showPasswordCheckbox.addEventListener('change', function() {
      const type = this.checked ? 'text' : 'password';
      newPasswordInput.type = type;
      confirmPasswordInput.type = type;
    });
  }

  // Add event listener for form submission
  const updatePasswordForm = document.getElementById('updatePasswordForm');
  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validation 1: Check if passwords match
      if (newPassword !== confirmPassword) {
        profileUpdateForm.innerHTML = `
          <div class="card">
            <h2>Update Password</h2>
            <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
              Passwords do not match.
            </div>
            ${updatePasswordForm.outerHTML}
          </div>
        `;
        // Reattach event listeners after re-rendering
        reattachPasswordFormListeners();
        return;
      }

      // Validation 2: Strong password rules
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
      if (!passwordRegex.test(newPassword)) {
        profileUpdateForm.innerHTML = `
          <div class="card">
            <h2>Update Password</h2>
            <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
              Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).
            </div>
            ${updatePasswordForm.outerHTML}
          </div>
        `;
        reattachPasswordFormListeners();
        return;
      }

      // Validation 3: Check for repetitive patterns
      const repetitivePatternRegex = /(.)\1{3,}|(?:0123|1234|2345|3456|4567|5678|6789|7890)/;
      if (repetitivePatternRegex.test(newPassword)) {
        profileUpdateForm.innerHTML = `
          <div class="card">
            <h2>Update Password</h2>
            <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
              Password contains repetitive or predictable patterns (e.g., "aaaa" or "1234"). Please use a more complex password.
            </div>
            ${updatePasswordForm.outerHTML}
          </div>
        `;
        reattachPasswordFormListeners();
        return;
      }

      // Validation 4: Check for common words
      const commonWords = ['password', 'admin', 'user', '123456', 'qwerty'];
      const lowerCasePassword = newPassword.toLowerCase();
      if (commonWords.some(word => lowerCasePassword.includes(word))) {
        profileUpdateForm.innerHTML = `
          <div class="card">
            <h2>Update Password</h2>
            <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
              Password contains a common word or phrase (e.g., "password", "admin"). Please use a more unique password.
            </div>
            ${updatePasswordForm.outerHTML}
          </div>
        `;
        reattachPasswordFormListeners();
        return;
      }

      // If all validations pass, send the new password to the backend
      const formData = new FormData();
      formData.append('new_password', newPassword);

      fetch('../pages/features/update_password.php', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          profileUpdateForm.innerHTML = `
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: green; padding: 10px; border: 1px solid green; border-radius: 4px; margin-bottom: 20px;">
                ${result.message}
              </div>
              <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage()">Back</button>
              </div>
            </div>
          `;
          setTimeout(() => {
            showWelcomeMessage();
          }, 1500);
        } else {
          profileUpdateForm.innerHTML = `
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                ${result.error || 'Failed to update password'}
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          `;
          reattachPasswordFormListeners();
        }
      })
      .catch(error => {
        profileUpdateForm.innerHTML = `
          <div class="card">
            <h2>Update Password</h2>
            <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
              Network error: ${error.message}
            </div>
            ${updatePasswordForm.outerHTML}
          </div>
        `;
        reattachPasswordFormListeners();
      });
    });
  }
}

// Helper function to reattach event listeners after re-rendering the password form
function reattachPasswordFormListeners() {
  const showPasswordCheckbox = document.getElementById('showPassword');
  const newPasswordInput = document.getElementById('new_password');
  const confirmPasswordInput = document.getElementById('confirm_password');
  const updatePasswordForm = document.getElementById('updatePasswordForm');

  if (showPasswordCheckbox && newPasswordInput && confirmPasswordInput) {
    showPasswordCheckbox.addEventListener('change', function() {
      const type = this.checked ? 'text' : 'password';
      newPasswordInput.type = type;
      confirmPasswordInput.type = type;
    });
  }

  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', function(event) {
      event.preventDefault();
      showUpdatePasswordForm(); // Re-call the function to handle form submission
    });
  }
}
// Show Salary Details section
function showSalaryDetails() {
  showSection('salary-details-section');
  fetchSalaryDetails();
}

function fetchSalaryDetails() {
  const salarySection = document.getElementById('salary-details-section');
  if (!salarySection) {
    console.error('Salary details section not found');
    return;
  }

  salarySection.innerHTML = `
    <div class="card">
      <h2>Salary Details</h2>
      <p>Loading salary details...</p>
    </div>
  `;

  fetch('../pages/features/fetch_salary_details.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_salary_details',
    }),
  })
    .then((response) => {
      console.log('Salary response status:', response.status);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('Salary data:', data);
      if (data.success && data.salary_details) {
        const salary = data.salary_details.salary || 'N/A';
        const employeeId = data.salary_details.employee_id || 'N/A';
        const jobTitle = data.salary_details.emp_job_title || 'N/A';
        const hireDate = data.salary_details.emp_hire_date || 'N/A';
        const departmentId = data.salary_details.department_id || 'N/A';

        const salaryValue = parseFloat(salary);
        const formattedSalary = isNaN(salaryValue) ? 'N/A' : `$${salaryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        salarySection.innerHTML = `
          <div class="card">
            <h2>Salary Details</h2>
            <div class="salary-details-container">
              <div class="salary-details-box">
                <h3>Overview</h3>
                <p><strong>Employee ID:</strong> ${employeeId}</p>
                <p><strong>Job Title:</strong> ${jobTitle}</p>
                <p><strong>Hire Date:</strong> ${hireDate}</p>
                <p><strong>Department ID:</strong> ${departmentId}</p>
              </div>
              <div class="salary-details-box">
                <h3>Compensation</h3>
                <p><strong>Current Salary:</strong> ${formattedSalary}</p>
              </div>
            </div>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      } else {
        salarySection.innerHTML = `
          <div class="card">
            <h2>Salary Details</h2>
            <p style="color: #ff0000;">${data.error || 'No salary details found.'}</p>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error('Error fetching salary details:', error);
      salarySection.innerHTML = `
        <div class="card">
          <h2>Salary Details</h2>
          <p style="color: #ff0000;">Error fetching salary details: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </div>
      `;
    });
}