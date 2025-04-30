// user_dashboard.js
function showSection(sectionId) {
  const sections = [
    'main-content',
    'projects-tasks-section',
    'mark-attendance-section',
    'attendance-history-section',
    'apply-leave-section',
    'track-leave-section',
    'faqs-section',
    'hr-contact-section',
    'profile-update-form',
    'salary-details-section',
    'feedback-section',
    'submit-exit-interview-section',
    'exit-interview-details-section',
    'salary-details-section',
    'enroll-training-section',
    'update-training-status-section',
    'update-address-section',
  ];
  sections.forEach((id) => {
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
  const status = 'present'; // Hardcoded since dropdown only has "Present"

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
            <td>
              <button class="delete-btn" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;" data-attendance-id="${
                record.attendance_id
              }">Delete</button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        // Attach event listeners to Delete buttons
        document.querySelectorAll('.delete-btn').forEach((button) => {
          button.addEventListener('click', () => {
            const attendanceId = button.getAttribute('data-attendance-id');
            deleteAttendance(attendanceId);
          });
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="4">No attendance records found.</td></tr>';
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      tableBody.innerHTML =
        '<tr><td colspan="4">Error fetching attendance history.</td></tr>';
    });
}

// Removed update attendance form and related functions to disable updating attendance records

// Delete attendance record
function deleteAttendance(attendanceId) {
  if (!confirm('Are you sure you want to delete this attendance record?')) {
    return;
  }

  fetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'delete_attendance',
      attendance_id: attendanceId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        fetchAttendanceHistory();
      } else {
        alert('Error: ' + (data.error || 'Failed to delete attendance'));
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while deleting attendance.');
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

function navigateToAttendanceHistory() {
  // Directly call showAttendanceHistory to ensure navigation
  showAttendanceHistory();
  // Optionally, close the dropdown to maintain UI consistency
  const dropdown = document.getElementById('attendance-dropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
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
  window.showEnrollTraining = showEnrollTraining;
  window.showUpdateTrainingStatus = showUpdateTrainingStatus;
  window.updateaddress = updateaddress;
  console.log('Global functions assigned to window object');

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

function showProfileForm() {
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (!profileUpdateForm) {
    console.error('Profile update form container not found');
    return;
  }

  showSection('profile-update-form');

  fetch('../pages/features/fetch_user_details.php')
    .then((response) => {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers.get('Content-Type'));
      return response.text().then((text) => {
        //console.log('Raw response:', text);
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

      profileUpdateForm.innerHTML = `
        <div class="card">
          <h2>Profile Details</h2>
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label for="employee_id">Employee ID:</label>
                <input type="text" id="employee_id" name="employee_id" value="${
                  data.employee_id
                }" readonly>
              </div>
              <div class="form-group">
                <label for="department_id">Department ID:</label>
                <input type="text" id="department_id" name="department_id" value="${
                  data.department_id || ''
                }" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="manager_id">Manager ID:</label>
                <input type="text" id="manager_id" name="manager_id" value="${
                  data.manager_id || ''
                }" readonly>
              </div>
              <div class="form-group">
                <label for="first_name">First Name:</label>
                <input type="text" id="first_name" name="first_name" value="${
                  data.first_name
                }" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="middle_name">Middle Name:</label>
                <input type="text" id="middle_name" name="middle_name" value="${
                  data.middle_name || ''
                }" readonly>
              </div>
              <div class="form-group">
                <label for="last_name">Last Name:</label>
                <input type="text" id="last_name" name="last_name" value="${
                  data.last_name
                }" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${
                  data.email || ''
                }" readonly>
              </div>
              <div class="form-group">
                <label for="phone_number">Phone Number:</label>
                <input type="tel" id="phone_number" name="phone_number" value="${
                  data.phone_number || ''
                }" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" name="dob" value="${
                  data.dob || ''
                }" readonly>
              </div>
              <div class="form-group">
                <label for="emp_hire_date">Hire Date:</label>
                <input type="date" id="emp_hire_date" name="emp_hire_date" value="${
                  data.emp_hire_date || ''
                }" readonly>
              </div>
            </div>
            <div class="form-group">
              <label>Emergency Contacts:</label>
              <div id="emergency_contacts">
                ${
                  data.emergency_contacts && data.emergency_contacts.length > 0
                    ? data.emergency_contacts
                        .map(
                          (contact, index) => `
                        <div class="emergency-contact" data-index="${index}">
                          <p><strong>Contact ${index + 1}:</strong></p>
                          <p>Name: <span class="contact-name">${
                            contact.contact_name || ''
                          }</span></p>
                          <p>Phone: <span class="contact-phone">${
                            contact.contact_phone || ''
                          }</span></p>
                          <p>Relationship: <span class="contact-relationship">${
                            contact.relationship || ''
                          }</span></p>
                        </div>
                      `
                        )
                        .join('')
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

      const editProfileBtn = document.getElementById('editProfileBtn');
      const form = document.getElementById('profileForm');

      if (editProfileBtn && form) {
        editProfileBtn.addEventListener('click', function () {
          form.querySelectorAll('input, textarea').forEach((field) => {
            if (['email', 'phone_number', 'dob'].includes(field.id)) {
              field.removeAttribute('readonly');
            }
          });

          const emergencyContactsDiv =
            document.getElementById('emergency_contacts');
          emergencyContactsDiv.innerHTML = `
            <div id="emergency_contacts_list">
              ${
                data.emergency_contacts && data.emergency_contacts.length > 0
                  ? data.emergency_contacts
                      .map(
                        (contact, index) => `
                      <div class="emergency-contact" data-index="${index}">
                        <p><strong>Contact ${index + 1}:</strong></p>
                        <div class="form-group">
                          <label for="contact_name_${index}">Name:</label>
                          <input type="text" id="contact_name_${index}" name="emergency_contacts[${index}][contact_name]" value="${
                          contact.contact_name || ''
                        }">
                        </div>
                        <div class="form-group">
                          <label for="contact_phone_${index}">Phone:</label>
                          <input type="tel" id="contact_phone_${index}" name="emergency_contacts[${index}][contact_phone]" value="${
                          contact.contact_phone || ''
                        }" pattern="[0-9]{10}" placeholder="1234567890">
                        </div>
                        <div class="form-group">
                          <label for="relationship_${index}">Relationship:</label>
                          <input type="text" id="relationship_${index}" name="emergency_contacts[${index}][relationship]" value="${
                          contact.relationship || ''
                        }">
                        </div>
                        <button type="button" class="remove-contact-btn" data-index="${index}">Remove Contact</button>
                      </div>
                    `
                      )
                      .join('')
                  : '<p>No emergency contacts available.</p>'
              }
            </div>
            <button type="button" id="add_contact_btn">Add Emergency Contact</button>
          `;

          const addContactBtn = document.getElementById('add_contact_btn');
          if (addContactBtn) {
            addContactBtn.addEventListener('click', function () {
              const contactList = document.getElementById(
                'emergency_contacts_list'
              );
              const index =
                document.querySelectorAll('.emergency-contact').length;
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

          function addRemoveContactListeners() {
            document.querySelectorAll('.remove-contact-btn').forEach((btn) => {
              btn.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                document
                  .querySelector(`.emergency-contact[data-index="${index}"]`)
                  .remove();
              });
            });
          }
          addRemoveContactListeners();

          editProfileBtn.outerHTML = `
            <button type="submit" id="saveProfileBtn">Save Changes</button>
            <button type="button" id="cancelEditBtn">Cancel</button>
          `;

          const cancelEditBtn = document.getElementById('cancelEditBtn');
          if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function () {
              showProfileForm();
            });
          }
        });

        form.addEventListener('submit', function (event) {
          event.preventDefault();

          // Validate DOB (must be 18 years or older)
          const dobInput = document.getElementById('dob');

          if (!dobInput) {
            console.error('DOB input element not found', dobInput);
            alert('Error: Date of Birth field is missing.');
            return;
          }

          if (dobInput.value) {
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

          // Validate emergency contacts
          const emergencyContacts =
            document.querySelectorAll('.emergency-contact');
          for (let i = 0; i < emergencyContacts.length; i++) {
            const contact = emergencyContacts[i];
            const index = contact.getAttribute('data-index');
            const contactName = document
              .getElementById(`contact_name_${index}`)
              .value.trim();
            const contactPhone = document
              .getElementById(`contact_phone_${index}`)
              .value.trim();
            const relationship = document
              .getElementById(`relationship_${index}`)
              .value.trim();

            if (!contactName || !contactPhone || !relationship) {
              alert(`All fields are required for Emergency Contact ${i + 1}.`);
              return;
            }

            if (!/^[0-9]{10}$/.test(contactPhone)) {
              alert(
                `Phone number for Emergency Contact ${
                  i + 1
                } must be exactly 10 digits.`
              );
              return;
            }
          }

          const formData = new FormData(this);

          fetch('../pages/features/update_user_details.php', {
            method: 'POST',
            body: formData,
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.success) {
                alert(result.message);
                showProfileForm();
              } else {
                alert(result.error || 'Failed to update profile');
              }
            })
            .catch((error) => alert('Network error: ' + error.message));
        });
      }
    })
    .catch((error) => {
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

function showUpdatePasswordForm() {
  console.log('showUpdatePasswordForm called');
  const profileUpdateForm = document.getElementById('profile-update-form');
  console.log('profile-update-form element:', profileUpdateForm);
  if (!profileUpdateForm) {
    console.error('Profile update form container not found');
    return;
  }

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
        <div id="passwordError" style="margin-top: 10px; color: red; font-size: 14px;"></div>
      </form>
    </div>
  `;
  console.log('Update Password form rendered in profile-update-form');

  const showPasswordCheckbox = document.getElementById('showPassword');
  const newPasswordInput = document.getElementById('new_password');
  const confirmPasswordInput = document.getElementById('confirm_password');
  const errorDiv = document.getElementById('passwordError');
  const updatePasswordForm = document.getElementById('updatePasswordForm');

  if (showPasswordCheckbox && newPasswordInput && confirmPasswordInput) {
    showPasswordCheckbox.addEventListener('change', function () {
      const type = this.checked ? 'text' : 'password';
      newPasswordInput.type = type;
      confirmPasswordInput.type = type;
    });
  }

  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Clear any previous error message
      if (errorDiv) errorDiv.innerHTML = '';

      // Validation 1: Check if passwords match
      if (newPassword !== confirmPassword) {
        if (errorDiv) {
          errorDiv.innerHTML = 'Passwords do not match.';
        }
        return;
      }

      // Validation 2: Strong password rules
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
      if (!passwordRegex.test(newPassword)) {
        if (errorDiv) {
          errorDiv.innerHTML =
            'Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).';
        }
        return;
      }

      // Validation 3: Check for repetitive patterns
      const repetitivePatternRegex =
        /(.)\1{3,}|(?:0123|1234|2345|3456|4567|5678|6789|7890)/;
      if (repetitivePatternRegex.test(newPassword)) {
        if (errorDiv) {
          errorDiv.innerHTML =
            'Password contains repetitive or predictable patterns (e.g., "aaaa" or "1234"). Please use a more complex password.';
        }
        return;
      }

      // Validation 4: Check for common words
      const commonWords = ['password', 'admin', 'user', '123456', 'qwerty'];
      const lowerCasePassword = newPassword.toLowerCase();
      if (commonWords.some((word) => lowerCasePassword.includes(word))) {
        if (errorDiv) {
          errorDiv.innerHTML =
            'Password contains a common word or phrase (e.g., "password", "admin"). Please use a more unique password.';
        }
        return;
      }

      // If all validations pass, send the new password to the backend
      const formData = new FormData();
      formData.append('new_password', newPassword);

      fetch('../pages/features/update_password.php', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
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
            if (errorDiv) {
              errorDiv.innerHTML = result.error || 'Failed to update password';
            }
          }
        })
        .catch((error) => {
          if (errorDiv) {
            errorDiv.innerHTML = `Network error: ${error.message}`;
          }
        });
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
        const formattedSalary = isNaN(salaryValue)
          ? 'N/A'
          : `$${salaryValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;

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
            <p style="color: #ff0000;">${
              data.error || 'No salary details found.'
            }</p>
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

// Show Feedback Section
function showFeedback() {
  showSection('feedback-section');
  fetchFeedback();
}

// Fetch and Display Feedback
function fetchFeedback() {
  const feedbackSection = document.getElementById('feedback-section');
  if (!feedbackSection) {
    console.error('Feedback section not found');
    return;
  }

  feedbackSection.innerHTML = `
    <div class="card">
      <h2>My Feedback</h2>
      <p>Loading feedback...</p>
    </div>
  `;

  fetch('../pages/features/fetch_employee_feedback.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_feedback',
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      if (data.success && data.feedback && data.feedback.length > 0) {
        feedbackSection.innerHTML = `
            <h2>My Feedback</h2>
            <table>
              <thead>
                <tr>
                  <th>Reviewer ID</th>
                  <th>Rating</th>
                  <th>Type</th>
                  <th>Feedback</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${data.feedback
                  .map(
                    (f) => `
                  <tr>
                    <td>${f.reviewer_id}</td>
                    <td>${f.rating}</td>
                    <td>${f.feedback_type}</td>
                    <td>${f.feedback_text}</td>
                    <td>${f.date_submitted}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
      } else {
        feedbackSection.innerHTML = `
          <div class="card">
            <h2>My Feedback</h2>
            <p style="color: #ff0000;">${data.error || 'No feedback found.'}</p>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error('Error fetching feedback:', error);
      feedbackSection.innerHTML = `
        <div class="card">
          <h2>My Feedback</h2>
          <p style="color: #ff0000;">Error fetching feedback: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </div>
      `;
    });
}

function showSubmitExitInterviewForm() {
  showSection('submit-exit-interview-section');
  const exitInterviewSection = document.getElementById(
    'submit-exit-interview-section'
  );
  if (!exitInterviewSection) {
    console.error('Submit exit interview section not found');
    return;
  }

  // Check if an exit interview exists
  fetch('../pages/features/fetch_employee_exit_interview.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_exit_interview',
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      if (
        data.error ===
        "You don't have any exit interview to submit. Contact your manager for any queries."
      ) {
        // No exit interview record exists, show message
        exitInterviewSection.innerHTML = `
            <h2>Submit Exit Interview Details</h2>
            <div style="color: #ff0000; line-height: 1.6;">
              <p>You don't have any exit interview to submit.</p>
              <p>Contact your manager for any queries.</p>
            </div>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
      } else if (data.success && data.exit_interview) {
        // Exit interview is fully submitted, show message
        exitInterviewSection.innerHTML = `
            <h2>Submit Exit Interview Details</h2>
            <div style="color: #4CAF50; line-height: 1.6;">
              <p>You have submitted your exit interview already.</p>
              <p>There are no pending exit interviews for now.</p>
              <p>Contact your manager for any questions.</p>
            </div>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
      } else {
        // No exit interview or incomplete, show the form
        // If the record exists but is incomplete, prefill the form with existing data
        const existingData = data.exit_interview || {};
        exitInterviewSection.innerHTML = `
          <div class="card">
            <h2>Submit Exit Interview Details</h2>
            <form id="exit-interview-form">
              <div class="form-group">
                <label for="resignation_type">Resignation Type:</label>
                <select id="resignation_type" name="resignation_type" required>
                  <option value="">Select Resignation Type</option>
                  <option value="Voluntary" ${
                    existingData.resignation_type === 'Voluntary'
                      ? 'selected'
                      : ''
                  }>Voluntary</option>
                  <option value="Involuntary" ${
                    existingData.resignation_type === 'Involuntary'
                      ? 'selected'
                      : ''
                  }>Involuntary</option>
                </select>
              </div>
              <div class="form-group">
                <label for="primary_reason">Primary Reason for Leaving:</label>
                <textarea id="primary_reason" name="primary_reason" rows="4" placeholder="Enter the primary reason for leaving" required>${
                  existingData.primary_reason || ''
                }</textarea>
              </div>
              <div class="form-group">
                <label for="overall_satisfaction_rating">Overall Satisfaction Rating (1-5):</label>
                <select id="overall_satisfaction_rating" name="overall_satisfaction_rating" required>
                  <option value="">Select Rating</option>
                  <option value="1" ${
                    existingData.overall_satisfaction_rating === '1'
                      ? 'selected'
                      : ''
                  }>1 - Very Dissatisfied</option>
                  <option value="2" ${
                    existingData.overall_satisfaction_rating === '2'
                      ? 'selected'
                      : ''
                  }>2 - Dissatisfied</option>
                  <option value="3" ${
                    existingData.overall_satisfaction_rating === '3'
                      ? 'selected'
                      : ''
                  }>3 - Neutral</option>
                  <option value="4" ${
                    existingData.overall_satisfaction_rating === '4'
                      ? 'selected'
                      : ''
                  }>4 - Satisfied</option>
                  <option value="5" ${
                    existingData.overall_satisfaction_rating === '5'
                      ? 'selected'
                      : ''
                  }>5 - Very Satisfied</option>
                </select>
              </div>
              <div class="form-group">
                <label for="knowledge_transfer_status">Knowledge Transfer Status:</label>
                <textarea id="knowledge_transfer_status" name="knowledge_transfer_status" rows="4" placeholder="Describe the status of knowledge transfer">${
                  existingData.knowledge_transfer_status || ''
                }</textarea>
              </div>
              <div class="form-group">
                <label for="assets_returned">Assets Returned:</label>
                <select id="assets_returned" name="assets_returned" required>
                  <option value="">Select Option</option>
                  <option value="1" ${
                    existingData.assets_returned === '1' ? 'selected' : ''
                  }>Yes</option>
                  <option value="0" ${
                    existingData.assets_returned === '0' ? 'selected' : ''
                  }>No</option>
                </select>
              </div>
              <div class="form-group button-group">
                <button type="submit">Submit</button>
                <button type="button" onclick="showWelcomeMessage()">Back</button>
              </div>
            </form>
          </div>
        `;

        // Add event listener for form submission
        document
          .getElementById('exit-interview-form')
          .addEventListener('submit', function (e) {
            e.preventDefault();
            submitExitInterview();
          });
      }
    })
    .catch((error) => {
      console.error('Error checking exit interview status:', error);
      exitInterviewSection.innerHTML = `
        <div class="card">
          <h2>Submit Exit Interview Details</h2>
          <p style="color: #ff0000;">Error checking exit interview status: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </div>
      `;
    });
}

function submitExitInterview() {
  const exitInterviewSection = document.getElementById(
    'submit-exit-interview-section'
  );
  if (!exitInterviewSection) {
    console.error('Submit exit interview section not found');
    return;
  }

  const resignationType = document.getElementById('resignation_type').value;
  const primaryReason = document.getElementById('primary_reason').value.trim();
  const overallSatisfactionRating = document.getElementById(
    'overall_satisfaction_rating'
  ).value;
  const knowledgeTransferStatus = document
    .getElementById('knowledge_transfer_status')
    .value.trim();
  const assetsReturned = document.getElementById('assets_returned').value;

  // Log the form values for debugging
  console.log('Form Values:', {
    resignation_type: resignationType,
    primary_reason: primaryReason,
    overall_satisfaction_rating: overallSatisfactionRating,
    knowledge_transfer_status: knowledgeTransferStatus,
    assets_returned: assetsReturned,
  });

  // Client-side validation
  let errors = [];
  if (!resignationType) {
    errors.push('Resignation Type is required.');
    document.getElementById('resignation_type').style.border = '1px solid red';
  } else {
    document.getElementById('resignation_type').style.border = '';
  }
  if (!primaryReason) {
    errors.push('Primary Reason for Leaving is required.');
    document.getElementById('primary_reason').style.border = '1px solid red';
  } else {
    document.getElementById('primary_reason').style.border = '';
  }
  if (!overallSatisfactionRating) {
    errors.push('Overall Satisfaction Rating is required.');
    document.getElementById('overall_satisfaction_rating').style.border =
      '1px solid red';
  } else {
    document.getElementById('overall_satisfaction_rating').style.border = '';
  }
  if (assetsReturned === '') {
    errors.push('Assets Returned is required.');
    document.getElementById('assets_returned').style.border = '1px solid red';
  } else {
    document.getElementById('assets_returned').style.border = '';
  }

  if (errors.length > 0) {
    exitInterviewSection.innerHTML = `
      <div class="card">
        <h2>Submit Exit Interview Details</h2>
        <p style="color: #ff0000;">${errors.join('<br>')}</p>
        <div class="form-group button-group">
          <button type="button" onclick="showSubmitExitInterviewForm()">Try Again</button>
          <button type="button" onclick="showWelcomeMessage()">Back</button>
        </div>
      </div>
    `;
    return;
  }

  // Create FormData to ensure proper encoding
  const formData = new FormData();
  formData.append('action', 'submit_exit_interview');
  formData.append('resignation_type', resignationType);
  formData.append('primary_reason', primaryReason);
  formData.append('overall_satisfaction_rating', overallSatisfactionRating);
  formData.append('knowledge_transfer_status', knowledgeTransferStatus);
  formData.append('assets_returned', assetsReturned);

  fetch('../pages/features/submit_exit_interview.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('Server Response:', data);
      if (data.success) {
        // Show alert with success message
        alert('Exit interview details submitted successfully!');

        // Update the section with the new message
        exitInterviewSection.innerHTML = `
          <div class="card">
            <h2>Submit Exit Interview Details</h2>
            <p style="color: #4CAF50;">
              You have submitted your exit interview already. 
              There are no pending exit interviews for now. 
              Contact your manager for any questions.
            </p>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      } else {
        exitInterviewSection.innerHTML = `
          <div class="card">
            <h2>Submit Exit Interview Details</h2>
            <p style="color: #ff0000;">${
              data.error || 'Failed to submit exit interview details.'
            }</p>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error('Error submitting exit interview:', error);
      exitInterviewSection.innerHTML = `
        <div class="card">
          <h2>Submit Exit Interview Details</h2>
          <p style="color: #ff0000;">Error submitting exit interview: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </div>
      `;
    });
}

// Show Exit Interview Details
function showExitInterviewDetails() {
  showSection('exit-interview-details-section');
  fetchExitInterviewDetails();
}

// Fetch and Display Exit Interview Details
function fetchExitInterviewDetails() {
  const exitInterviewDetailsSection = document.getElementById(
    'exit-interview-details-section'
  );
  if (!exitInterviewDetailsSection) {
    console.error('Exit interview details section not found');
    return;
  }

  exitInterviewDetailsSection.innerHTML = `
    <div class="card">
      <h2>Exit Interview Details</h2>
      <p>Loading exit interview details...</p>
    </div>
  `;

  fetch('../pages/features/fetch_employee_exit_interview.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_exit_interview',
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      if (data.success && data.exit_interview) {
        const ei = data.exit_interview;
        exitInterviewDetailsSection.innerHTML = `
            <h2>Exit Interview Details</h2>
            <div class="salary-details-container">
              <div class="salary-details-box">
                <h3>Details</h3>
                <p><strong>Interview Date:</strong> ${
                  ei.interview_date || 'N/A'
                }</p>
                <p><strong>Last Working Date:</strong> ${
                  ei.last_working_date || 'N/A'
                }</p>
                <p><strong>Resignation Type:</strong> ${
                  ei.resignation_type || 'N/A'
                }</p>
                <p><strong>Primary Reason:</strong> ${
                  ei.primary_reason || 'N/A'
                }</p>
                <p><strong>Overall Satisfaction Rating:</strong> ${
                  ei.overall_satisfaction_rating || 'N/A'
                }</p>
                <p><strong>Knowledge Transfer Status:</strong> ${
                  ei.knowledge_transfer_status || 'N/A'
                }</p>
                <p><strong>Assets Returned:</strong> ${
                  ei.assets_returned == 1 ? 'Yes' : 'No'
                }</p>
                <p><strong>Eligible for Rehire:</strong> ${
                  ei.eligible_for_rehire == 1 ? 'Yes' : 'No'
                }</p>
              </div>
            </div>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
      } else {
        exitInterviewDetailsSection.innerHTML = `
            <h2>Exit Interview Details</h2>
            <p style="color: #ff0000;">${
              data.error || 'No exit interview details found.'
            }</p>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
      }
    })
    .catch((error) => {
      console.error('Error fetching exit interview details:', error);
      exitInterviewDetailsSection.innerHTML = `
          <h2>Exit Interview Details</h2>
          <p style="color: #ff0000;">Error fetching exit interview details: ${error.message}</p>
          <div class="form-group button-group">
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
      `;
    });
}

// Show Salary Details section
function showSalaryDetails() {
  showSection('salary-details-section');
  fetchSalaryDetails();
}

// Fetch and display salary details
function fetchSalaryDetails() {
  const salarySection = document.getElementById('salary-details-section');
  if (!salarySection) {
    console.error('Salary details section not found');
    return;
  }

  // Display a loading message while fetching data
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

        // Display the salary details in a dashboard format
        salarySection.innerHTML = `
          <div class="card">
            <h2>Salary Details</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
              <div style="flex: 1; min-width: 250px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="font-size: 18px; color: #333; margin-bottom: 10px;">Overview</h3>
                <p><strong>Employee ID:</strong> ${employeeId}</p>
                <p><strong>Job Title:</strong> ${jobTitle}</p>
                <p><strong>Hire Date:</strong> ${hireDate}</p>
                <p><strong>Department ID:</strong> ${departmentId}</p>
              </div>
              <div style="flex: 1; min-width: 250px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="font-size: 18px; color: #333; margin-bottom: 10px;">Compensation</h3>
                <p><strong>Current Salary:</strong> $${parseFloat(
                  salary
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</p>
              </div>
            </div>
            <div class="form-group button-group" style="margin-top: 20px;">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      } else {
        salarySection.innerHTML = `
          <div class="card">
            <h2>Salary Details</h2>
            <p style="color: #ff0000;">${
              data.error || 'No salary details found.'
            }</p>
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

// Show Enroll in Training Programs section
function showEnrollTraining() {
  console.log('showEnrollTraining called');
  showSection('enroll-training-section');
  fetchDepartments(); // Fetch departments to populate the filter
  fetchAvailableTrainings();
}

// Fetch departments for the training filter
function fetchDepartments() {
  console.log('fetchDepartments called');
  const trainingFilter = document.getElementById('training_filter');
  if (!trainingFilter) {
    console.error('training_filter element not found');
    return;
  }
  console.log('training_filter element found');

  // Clear the dropdown
  trainingFilter.innerHTML = '';

  // Since we only want the employee's department, fetch only that department's details
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_employee_department', // New action to fetch only the employee's department
      employee_department_id: employeeDepartmentId, // Pass the employee's department ID
    }),
  })
    .then((response) => {
      console.log('fetchDepartments response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('fetchDepartments data:', data);
      if (data.success && data.department) {
        // Add only the employee's department to the dropdown
        const option = document.createElement('option');
        option.value = data.department.department_id;
        option.textContent = data.department.department_name;
        trainingFilter.appendChild(option);
        trainingFilter.value = data.department.department_id; // Set the value to the employee's department
        console.log(
          'Set training_filter to employee department:',
          data.department.department_id
        );
      } else {
        console.error(
          'fetchDepartments failed:',
          data.error || 'No department found'
        );
      }
    })
    .catch((error) => {
      console.error('Error fetching department:', error);
    });
}

// Fetch available training programs
function fetchAvailableTrainings() {
  console.log('fetchAvailableTrainings called');
  const tableBody = document.getElementById('available-trainings-table-body');
  const departmentId = document.getElementById('training_filter').value;
  if (!tableBody) {
    console.error('available-trainings-table-body element not found');
    return;
  }
  console.log('Department ID for fetch:', departmentId);
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_available_trainings',
      department_id: departmentId,
    }),
  })
    .then((response) => {
      console.log('fetchAvailableTrainings response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('fetchAvailableTrainings data:', data);
      tableBody.innerHTML = '';
      if (data.success && data.trainings && data.trainings.length > 0) {
        data.trainings.forEach((training) => {
          const row = document.createElement('tr');
          row.innerHTML = `
                    <td>${training.training_name}</td>
                    <td>${training.training_date}</td>
                    <td>${training.end_date}</td>
                    <td>${training.certificate || 'N/A'}</td>
                    <td>${training.department_id}</td>
                    <td>
                        <button onclick="enrollInTraining(${
                          training.training_id
                        })">Enroll</button>
                    </td>
                `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="6">No training programs available.</td></tr>';
        console.log(
          'No trainings available or fetch failed:',
          data.error || 'Unknown error'
        );
      }
    })
    .catch((error) => {
      console.error('Error fetching available trainings:', error);
      tableBody.innerHTML =
        '<tr><td colspan="6">Error fetching training programs.</td></tr>';
    });
}

// Enroll in a training program
function enrollInTraining(trainingId) {
  console.log('enrollInTraining called with trainingId:', trainingId);
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'enroll_training',
      training_id: trainingId,
    }),
  })
    .then((response) => {
      console.log('enrollInTraining response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('enrollInTraining data:', data);
      if (data.success) {
        alert(data.message);
        fetchAvailableTrainings();
      } else {
        alert('Error: ' + (data.error || 'Failed to enroll in training'));
      }
    })
    .catch((error) => {
      console.error('Error enrolling in training:', error);
      alert('An error occurred while enrolling in training.');
    });
}

// Show Update Training Status section
function showUpdateTrainingStatus() {
  console.log('showUpdateTrainingStatus called');
  showSection('update-training-status-section');
  fetchEnrolledTrainings();
}

// Fetch enrolled training programs
function fetchEnrolledTrainings() {
  console.log('fetchEnrolledTrainings called');
  const tableBody = document.getElementById('enrolled-trainings-table-body');
  if (!tableBody) {
    console.error('enrolled-trainings-table-body element not found');
    return;
  }
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_enrolled_trainings',
    }),
  })
    .then((response) => {
      console.log('fetchEnrolledTrainings response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('fetchEnrolledTrainings data:', data);
      tableBody.innerHTML = '';
      if (
        data.success &&
        data.enrolled_trainings &&
        data.enrolled_trainings.length > 0
      ) {
        data.enrolled_trainings.forEach((training) => {
          const row = document.createElement('tr');
          const isScoreDisabled =
            training.completion_status !== 'Completed' ? 'disabled' : '';
          row.innerHTML = `
                    <td>${training.training_name}</td>
                    <td>${training.enrollment_date}</td>
                    <td>
                        <select onchange="updateTrainingStatus(${
                          training.employee_training_id
                        }, this.value)">
                            <option value="Not Started" ${
                              training.completion_status === 'Not Started'
                                ? 'selected'
                                : ''
                            }>Not Started</option>
                            <option value="In Progress" ${
                              training.completion_status === 'In Progress'
                                ? 'selected'
                                : ''
                            }>In Progress</option>
                            <option value="Completed" ${
                              training.completion_status === 'Completed'
                                ? 'selected'
                                : ''
                            }>Completed</option>
                        </select>
                    </td>
                    <td>
                        <input type="number" value="${
                          training.score || ''
                        }" min="0" max="100" onchange="updateTrainingScore(${
            training.employee_training_id
          }, this.value)" placeholder="Enter score (0-100)" ${isScoreDisabled}>
                    </td>
                    <td>
                      <button style="margin-bottom: 2px;" onclick="updateTraining(${
                        training.employee_training_id
                      })">Update</button>
                      <button style="margin-top: 2px;" onclick="dropTraining(${
                        training.employee_training_id
                      })">Drop</button>
                    </td>
                `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="5">No enrolled training programs found.</td></tr>';
        console.log(
          'No enrolled trainings found or fetch failed:',
          data.error || 'Unknown error'
        );
      }
    })
    .catch((error) => {
      console.error('Error fetching enrolled trainings:', error);
      tableBody.innerHTML =
        '<tr><td colspan="5">Error fetching enrolled trainings.</td></tr>';
    });
}

// Drop a training program
function dropTraining(employeeTrainingId) {
  console.log(
    'dropTraining called with employeeTrainingId:',
    employeeTrainingId
  );
  if (!confirm('Are you sure you want to drop this training program?')) {
    return;
  }

  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'drop_training',
      employee_training_id: employeeTrainingId,
    }),
  })
    .then((response) => {
      console.log('dropTraining response received:', response);
      // Log the raw text response before parsing to catch JSON issues
      return response.text().then((text) => {
        console.log('Raw response text:', text);
        return JSON.parse(text);
      });
    })
    .then((data) => {
      console.log('dropTraining data:', data);
      if (data.success) {
        alert(data.message);
        fetchEnrolledTrainings(); // Refresh the table
        fetchAvailableTrainings(); // Refresh available trainings in case the dropped training reappears
      } else {
        alert('Error: ' + (data.error || 'Failed to drop training program'));
      }
    })
    .catch((error) => {
      console.error('Error dropping training:', error);
      alert('An error occurred while dropping the training program.');
    });
}

// Update training status
function updateTrainingStatus(employeeTrainingId, newStatus) {
  console.log(
    'updateTrainingStatus called with employeeTrainingId:',
    employeeTrainingId,
    'newStatus:',
    newStatus
  );
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'update_training_status',
      employee_training_id: employeeTrainingId,
      completion_status: newStatus,
    }),
  })
    .then((response) => {
      console.log('updateTrainingStatus response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('updateTrainingStatus data:', data);
      if (data.success) {
        // Find the score input field for this training and enable/disable based on newStatus
        const scoreInput = document.querySelector(
          `input[onchange="updateTrainingScore(${employeeTrainingId}, this.value)"]`
        );
        if (scoreInput) {
          scoreInput.disabled = newStatus !== 'Completed';
          // Optionally clear the score if status is not "Completed"
          if (newStatus !== 'Completed') {
            scoreInput.value = '';
          }
        }
        alert(data.message);
        fetchEnrolledTrainings();
      } else {
        alert('Error: ' + (data.error || 'Failed to update training status'));
      }
    })
    .catch((error) => {
      console.error('Error updating training status:', error);
      alert('An error occurred while updating training status.');
    });
}

// Update training score
function updateTrainingScore(employeeTrainingId, newScore) {
  console.log(
    'updateTrainingScore called with employeeTrainingId:',
    employeeTrainingId,
    'newScore:',
    newScore
  );
  if (newScore < 0 || newScore > 100) {
    alert('Score must be between 0 and 100.');
    return;
  }
  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'update_training_score',
      employee_training_id: employeeTrainingId,
      score: newScore,
    }),
  })
    .then((response) => {
      console.log('updateTrainingScore response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('updateTrainingScore data:', data);
      if (data.success) {
        alert(data.message);
        fetchEnrolledTrainings();
      } else {
        alert('Error: ' + (data.error || 'Failed to update training score'));
      }
    })
    .catch((error) => {
      console.error('Error updating training score:', error);
      alert('An error occurred while updating training score.');
    });
}

// Update both status and score (called when clicking the "Update" button)
function updateTraining(employeeTrainingId) {
  console.log(
    'updateTraining called with employeeTrainingId:',
    employeeTrainingId
  );
  const statusSelect = document.querySelector(
    `select[onchange="updateTrainingStatus(${employeeTrainingId}, this.value)"]`
  );
  const scoreInput = document.querySelector(
    `input[onchange="updateTrainingScore(${employeeTrainingId}, this.value)"]`
  );
  const newStatus = statusSelect ? statusSelect.value : null;
  const newScore = scoreInput ? scoreInput.value : null;
  console.log('updateTraining - newStatus:', newStatus, 'newScore:', newScore);

  if (!newStatus) {
    alert('Please select a status.');
    return;
  }
  if (newScore && (newScore < 0 || newScore > 100)) {
    alert('Score must be between 0 and 100.');
    return;
  }

  fetch('../pages/user_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'update_training',
      employee_training_id: employeeTrainingId,
      completion_status: newStatus,
      score: newScore || null,
    }),
  })
    .then((response) => {
      console.log('updateTraining response received:', response);
      return response.json();
    })
    .then((data) => {
      console.log('updateTraining data:', data);
      if (data.success) {
        alert(data.message);
        fetchEnrolledTrainings();
      } else {
        alert('Error: ' + (data.error || 'Failed to update training'));
      }
    })
    .catch((error) => {
      console.error('Error updating training:', error);
      alert('An error occurred while updating training.');
    });
}

function updateaddress() {
  let employeeAddress = null;

  if (!employeeId) {
    console.error('Employee ID is not available');
    alert('Error: Employee ID is not available. Please log in again.');
    return;
  }

  showSection('update-address-section');

  const addressSection = document.getElementById('update-address-section');
  if (!addressSection) {
    console.error('Update address section not found');
    return;
  }

  addressSection.innerHTML = '<p>Loading address form...</p>';

  // Fetch existing address for the logged-in employee
  fetch(
    '../pages/features/fetch_employee_address.php?employee_id=' + employeeId,
    {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error('Server error: ' + response.status);
      return response.json();
    })
    .then((data) => {
      if (
        data.success &&
        Array.isArray(data.address) &&
        data.address.length > 0
      ) {
        employeeAddress = data.address[0];
        console.log('Employee Address:', employeeAddress); // Debug log
      }
      return fetch('../pages/features/fetch_reference_data.php', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
    })
    .then((response) => {
      if (!response.ok) throw new Error('Server error: ' + response.status);
      return response.json();
    })
    .then((refData) => {
      const { cities, zips, states } = refData;

      addressSection.innerHTML = `
        <h2>Update My Address</h2>
        <form id="updateAddressForm" method="POST">
          <input type="hidden" name="action" value="${
            employeeAddress ? 'update' : 'insert'
          }">
          <input type="hidden" name="employee_id" value="${employeeId}">
          <div class="form-group">
            <label for="street_name">Street Name:</label>
            <input type="text" id="street_name" name="street_name" value="${
              employeeAddress?.street_name || ''
            }" required>
          </div>
          <div class="form-group">
            <label for="apt">Apartment/Suite:</label>
            <input type="text" id="apt" name="apt" value="${
              employeeAddress?.Apt || ''
            }">
          </div>
          <div class="form-group">
            <label for="country">Country:</label>
            <input type="text" id="country" name="country" value="${
              employeeAddress?.Country || 'USA'
            }" required>
          </div>
          <div class="form-group">
            <label for="city_id">City:</label>
            <select id="city_id" name="city_id" required onchange="updateCityStateZipOptions(${employeeId}, this.value, 'city')">
              <option value="">Select a city or add new</option>
              ${cities
                .map(
                  (city) =>
                    `<option value="${city.city_id}" ${
                      employeeAddress?.city_id == city.city_id ? 'selected' : ''
                    }>${city.city_name}</option>`
                )
                .join('')}
              <option value="new">Add New City</option>
            </select>
            <input type="text" id="new_city" name="new_city" style="display:none;" placeholder="Enter new city name">
          </div>
          <div class="form-group">
            <label for="zip_id">Zip Code:</label>
            <select id="zip_id" name="zip_id" required onchange="updateCityStateZipOptions(${employeeId}, this.value, 'zip')">
              <option value="">Select a zip code or add new</option>
              ${zips
                .map(
                  (zip) =>
                    `<option value="${zip.zip_id}" ${
                      employeeAddress?.zip_id == zip.zip_id ? 'selected' : ''
                    }>${zip.zip_code}</option>`
                )
                .join('')}
              <option value="new">Add New Zip</option>
            </select>
            <input type="text" id="new_zip" name="new_zip" style="display:none;" placeholder="Enter new zip code (5 digits)">
          </div>
          <div class="form-group">
            <label for="state_id">State:</label>
            <select id="state_id" name="state_id" required onchange="updateCityStateZipOptions(${employeeId}, this.value, 'state')">
              <option value="">Select a state or add new</option>
              ${states
                .map(
                  (state) =>
                    `<option value="${state.state_id}" ${
                      employeeAddress?.state_id == state.state_id
                        ? 'selected'
                        : ''
                    }>${state.state_name}</option>`
                )
                .join('')}
              <option value="new">Add New State</option>
            </select>
            <input type="text" id="new_state" name="new_state" style="display:none;" placeholder="Enter new state name">
          </div>
          <div class="form-group button-group">
            <button type="submit">Save Address</button>
            <button type="button" onclick="showWelcomeMessage()">Back</button>
          </div>
        </form>
    `;

      const form = document.getElementById('updateAddressForm');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          const formData = new FormData(this);
          const action = formData.get('action');

          fetch('../pages/features/manage_address.php', {
            method: 'POST',
            body: formData,
          })
            .then((response) => {
              if (!response.ok)
                throw new Error('Server error: ' + response.status);
              return response.json();
            })
            .then((data) => {
              if (data.success) {
                alert(
                  'Address ' +
                    (action === 'update' ? 'updated' : 'saved') +
                    ' successfully!'
                );
                return fetch(
                  '../pages/features/fetch_employee_address.php?employee_id=' +
                    employeeId,
                  {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache' },
                  }
                ).then((res) => res.json());
              } else {
                throw new Error(data.error || 'Failed to save address.');
              }
            })
            .then((data) => {
              if (
                data.success &&
                Array.isArray(data.address) &&
                data.address.length > 0
              ) {
                employeeAddress = data.address[0];
                updateaddress(); // Re-render with updated data
              }
            })
            .catch((error) => {
              console.error('Error saving address:', error);
              alert('Error: ' + error.message);
            });
        });

        // Initial call to populate zip options
        updateCityStateZipOptions(
          employeeId,
          employeeAddress?.city_id || '',
          'zip'
        );
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      addressSection.innerHTML = `
      <div class="card">
        <h2>Update My Address</h2>
        <p style="color: #ff0000;">Error loading address form: ${error.message}. Please contact support.</p>
        <div class="form-group button-group">
          <button type="button" onclick="showWelcomeMessage()">Back</button>
        </div>
      </div>
    `;
    });
}
function updateCityStateZipOptions(employeeId, value, type) {
  const select = document.getElementById(`${type}_id`);
  const newInput = document.getElementById(`new_${type}`);

  if (value === 'new') {
    newInput.style.display = 'block';
    select.style.display = 'none'; // Optionally hide the select when adding new
  } else {
    newInput.style.display = 'none';
    select.style.display = 'block';
    if (type === 'city' && value !== '') {
      // Fetch and update zip options when a valid city is selected
      fetch('../pages/features/fetch_reference_data.php?city_id=' + value, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Server error: ' + response.status);
          return response.json();
        })
        .then((data) => {
          const { zips } = data;
          const zipSelect = document.getElementById('zip_id');
          zipSelect.innerHTML =
            '<option value="">Select a zip code or add new</option>';
          if (zips && zips.length > 0) {
            zips.forEach((zip) => {
              zipSelect.innerHTML += `<option value="${zip.zip_id}">${zip.zip_code}</option>`;
            });
          }
          zipSelect.innerHTML += '<option value="new">Add New Zip</option>';
        })
        .catch((error) => {
          console.error('Error fetching zip options:', error);
          alert('Error loading zip codes: ' + error.message);
        });
    }
  }
}

// Ensure sections are rendered only once
let sectionsRendered = false;

// Render Leave Sections Dynamically
function renderLeaveSections() {
  if (sectionsRendered) return; // Prevent re-rendering

  const container = document.getElementById('content-area'); // Target the correct container
  if (!container) {
    console.error('Container #content-area not found.');
    return;
  }

  const leaveSections = `
    <div id="apply-leave-section" class="dashboard-section card" style="display: none;">
      <h2>Apply for Leave</h2>
      <form id="apply-leave-form">
        <div class="form-group">
          <label for="leave_type_id">Leave Type:</label>
          <select id="leave_type_id" name="leave_type_id" required>
            <option value="">Select Leave Type</option>
          </select>
        </div>
        <div class="form-group">
          <label for="leave_start_date">Start Date:</label>
          <input type="date" id="leave_start_date" name="leave_start_date" required>
        </div>
        <div class="form-group">
          <label for="leave_end_date">End Date:</label>
          <input type="date" id="leave_end_date" name="leave_end_date" required>
        </div>
        <div class="form-group">
          <label for="leave_reason">Reason for Leave:</label>
          <textarea id="leave_reason" name="leave_reason" rows="3" required></textarea>
        </div>
        <div class="form-group button-group">
          <button type="submit">Apply</button>
          <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
        </div>
      </form>
      <h3>Leave Balance</h3>
      <table id="leave-balance-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Total Days Allocated</th>
            <th>Days Used</th>
            <th>Remaining Days</th>
          </tr>
        </thead>
        <tbody id="leave-balance-table-body"></tbody>
      </table>
    </div>

    <div id="track-leave-section" class="dashboard-section card" style="display: none;">
      <h2>Track Leave Requests</h2>
      <div class="form-group">
        <label for="leave_filter">Filter by Status:</label>
        <select id="leave_filter" onchange="fetchLeaveRequests()">
          <option value="ispending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="leave-requests-table"></tbody>
      </table>
      <div class="form-group button-group">
        <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', leaveSections);
  sectionsRendered = true; // Mark as rendered
}

// Call this function on page load to render the sections
document.addEventListener('DOMContentLoaded', () => {
  renderLeaveSections();
});

// Show apply for leave form
function showApplyLeaveForm() {
  showSection('apply-leave-section');
  const form = document.getElementById('apply-leave-form');
  if (form) {
    form.reset();
    form.removeEventListener('submit', handleApplyLeaveSubmit);
    form.addEventListener('submit', handleApplyLeaveSubmit);
  }
  fetchLeaveBalance();
  fetchLeaveTypes();
}

// Fetch leave types for dropdown
function fetchLeaveTypes() {
  fetch('../pages/features/leave_request.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_leave_types',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const leaveTypeSelect = document.getElementById('leave_type_id');
      leaveTypeSelect.innerHTML = '<option value="">Select Leave Type</option>';
      if (data.success && data.leave_types) {
        data.leave_types.forEach((type) => {
          const option = document.createElement('option');
          option.value = type.leave_type_id;
          option.text = type.leave_name;
          option.dataset.leaveName = type.leave_name;
          leaveTypeSelect.appendChild(option);
        });
        // Fetch leave balance after populating leave types to update remaining days
        fetchLeaveBalance();
      } else {
        alert('Error: ' + (data.error || 'Failed to fetch leave types'));
      }
    })
    .catch((error) => {
      console.error('Error fetching leave types:', error);
      alert('Error fetching leave types: ' + error.message);
    });
}

function handleApplyLeaveSubmit(event) {
  event.preventDefault();
  const form = document.getElementById('apply-leave-form');
  const leaveTypeId = document.getElementById('leave_type_id').value;
  const startDate = document.getElementById('leave_start_date').value;
  const endDate = document.getElementById('leave_end_date').value;
  const leaveReason = document.getElementById('leave_reason').value;

  // Client-side validation
  const today = new Date().toISOString().split('T')[0];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!leaveTypeId || !startDate || !endDate || !leaveReason) {
    alert('All fields are required.');
    return;
  }
  if (startDate < today) {
    alert('Start date cannot be in the past.');
    return;
  }
  if (start > end) {
    alert('Start date must be before end date.');
    return;
  }

  fetch('../pages/features/leave_request.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'apply_leave',
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      leave_reason: leaveReason,
    }),
  })
    .then((response) => {
      // Log the raw response text for debugging
      return response.text().then((text) => {
        console.log('Raw response:', text);
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Failed to parse JSON: ' + text);
        }
      });
    })
    .then((data) => {
      if (data.success) {
        alert(data.message);
        form.reset();
        fetchLeaveBalance();
        showTrackLeaveRequests();
      } else {
        alert('Error: ' + (data.error || 'Failed to apply for leave'));
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred while applying for leave: ' + error.message);
    });
}

// Fetch and display leave balance
function fetchLeaveBalance() {
  fetch('../pages/features/leave_request.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_leave_balance',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.leave_balances) {
        const leaveTypeSelect = document.getElementById('leave_type_id');
        const options = leaveTypeSelect.options;

        // Update dropdown with remaining days for all leave types
        for (let i = 1; i < options.length; i++) {
          const leaveTypeId = options[i].value;
          const leaveName = options[i].dataset.leaveName;
          const balance = data.leave_balances.find(
            (b) => b.leave_type_id == leaveTypeId
          );
          if (balance) {
            options[
              i
            ].text = `${leaveName} (Remaining: ${balance.remaining_days} days)`;
          }
        }

        // Update leave balance table
        const tableBody = document.getElementById('leave-balance-table-body');
        tableBody.innerHTML = '';
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
        alert('Error: ' + (data.error || 'Failed to fetch leave balance'));
      }
    })
    .catch((error) => {
      console.error('Error fetching leave balance:', error);
      alert('Error fetching leave balance: ' + error.message);
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

  tableBody.innerHTML =
    '<tr><td colspan="4">Loading leave requests...</td></tr>';

  fetch('../pages/features/leave_request.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'fetch_leave_requests',
      leave_filter: leaveFilter,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = '';
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
