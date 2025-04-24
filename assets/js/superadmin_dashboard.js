// superadmin_dashboard.js

// Centralized function to manage section visibility
function showSection(sectionToShowId) {
  const sections = [
    'main-content',
    'reports-analytics',
    'create-user-form',
    'attendance-records',
    'leave-requests'
  ];

  const mainContent = document.getElementById('content-area');
  if (!mainContent) {
    console.error('content-area not found');
    return false;
  }

  // Hide all sections
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
    }
  });

  // Show the content-area and the specified section
  mainContent.style.display = 'block';
  const sectionToShow = document.getElementById(sectionToShowId);
  if (sectionToShow) {
    sectionToShow.style.display = 'block';
  } else {
    console.error(`${sectionToShowId} not found`);
    return false;
  }

  return true;
}

// Function to show error messages
function showError(message, containerId = 'content-area') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      `<div class="alert alert-error">${message}</div>` + container.innerHTML;
  }
}

// Function to show success messages
function showSuccess(message, containerId = 'content-area') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      `<div class="alert alert-success">${message}</div>` + container.innerHTML;
    setTimeout(() => {
      const successDiv = container.querySelector('.alert-success');
      if (successDiv) successDiv.remove();
    }, 3000);
  }
}

// Function to refresh report data
function refreshReportData(callback) {
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data§ion=reports',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.employees = data.employees || [];
        window.feedback = data.feedback || [];
        window.reportAvgRatings = data.report_avg_ratings || [];
        window.reportFeedbackTypes = data.report_feedback_types || [];
        window.projectAssignments = data.project_assignments || [];
        window.employeeTrainings = data.employee_trainings || [];
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to refresh data', 'reports-analytics');
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'reports-analytics')
    );
}

// Function to generate report for a given employee ID
function generateReport(selectedEmployeeId) {
  const employeeSearch = document.getElementById('employee-search');
  const reportContent = document.getElementById('report-content');
  if (!employeeSearch || !reportContent) {
    showError('Required elements not found', 'reports-analytics');
    return;
  }

  if (!selectedEmployeeId) {
    alert('Please select an employee to generate the report.');
    reportContent.style.display = 'none';
    return;
  }

  const filteredAvgRatings = window.reportAvgRatings.filter(
    (report) => String(report.employee_id) === selectedEmployeeId
  );
  const filteredFeedback = window.feedback.filter(
    (fb) => String(fb.employee_id) === selectedEmployeeId
  );
  const filteredFeedbackTypes = window.reportFeedbackTypes
    .filter((type) => {
      const typeFeedback = filteredFeedback.filter(
        (fb) => fb.feedback_type === type.feedback_type
      );
      return typeFeedback.length > 0;
    })
    .map((type) => ({
      feedback_type: type.feedback_type,
      type_count: filteredFeedback.filter(
        (fb) => fb.feedback_type === type.feedback_type
      ).length,
    }));
  const filteredAssignments = window.projectAssignments.filter(
    (assignment) => String(assignment.employee_id) === selectedEmployeeId
  );
  const filteredTrainings = window.employeeTrainings.filter(
    (training) => String(training.employee_id) === selectedEmployeeId
  );

  // Populate Average Ratings Table
  const avgRatingsTable = document.getElementById('avg-ratings-table');
  avgRatingsTable.innerHTML = '';
  if (filteredAvgRatings.length === 0) {
    avgRatingsTable.innerHTML = `<tr><td colspan="3">No feedback data available for this employee.</td></tr>`;
  } else {
    filteredAvgRatings.forEach((report) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${report.first_name} ${report.last_name}</td>
        <td>${parseFloat(report.avg_rating).toFixed(2)}</td>
        <td>${report.feedback_count}</td>
      `;
      avgRatingsTable.appendChild(row);
    });
  }

  // Populate Feedback Types Table
  const feedbackTypesTable = document.getElementById('feedback-types-table');
  feedbackTypesTable.innerHTML = '';
  if (filteredFeedbackTypes.length === 0) {
    feedbackTypesTable.innerHTML = `<tr><td colspan="2">No feedback data available for this employee.</td></tr>`;
  } else {
    filteredFeedbackTypes.forEach((report) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${report.feedback_type}</td>
        <td>${report.type_count}</td>
      `;
      feedbackTypesTable.appendChild(row);
    });
  }

  // Populate Work Summary Table
  const workSummaryTable = document.getElementById('work-summary-table');
  workSummaryTable.innerHTML = '';
  if (filteredFeedback.length === 0 && filteredAssignments.length === 0) {
    workSummaryTable.innerHTML = `<tr><td colspan="2">No work summary available for this employee.</td></tr>`;
  } else {
    if (filteredFeedback.length > 0) {
      const feedbackSummary = filteredFeedback
        .map(
          (fb) =>
            `${fb.feedback_type}: ${fb.feedback_text} (Rating: ${fb.rating}, Date: ${fb.date_submitted})`
        )
        .join('; ');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Feedback</td>
        <td>${feedbackSummary}</td>
      `;
      workSummaryTable.appendChild(row);
    }
    if (filteredAssignments.length > 0) {
      const projectSummary = filteredAssignments
        .map(
          (assignment) =>
            `${assignment.project_name} (Role: ${assignment.role_in_project})`
        )
        .join('; ');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Projects</td>
        <td>${projectSummary}</td>
      `;
      workSummaryTable.appendChild(row);
    }
  }

  // Populate Training Certificates Table
  const trainingTable = document.getElementById('training-certificates-table');
  trainingTable.innerHTML = '';
  if (filteredTrainings.length === 0) {
    trainingTable.innerHTML = `<tr><td colspan="4">No training certificates available for this employee.</td></tr>`;
  } else {
    filteredTrainings.forEach((training) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${training.training_name}</td>
        <td>${training.training_date || 'N/A'}</td>
        <td>${training.certificate || 'N/A'}</td>
        <td>${training.score || 'N/A'}</td>
      `;
      trainingTable.appendChild(row);
    });
  }

  // Populate Feedback Summary Table
  const feedbackSummaryTable = document.getElementById('feedback-summary-table');
  feedbackSummaryTable.innerHTML = '';
  if (filteredFeedback.length === 0) {
    feedbackSummaryTable.innerHTML = `<tr><td colspan="5">No feedback data available for this employee.</td></tr>`;
  } else {
    filteredFeedback.forEach((fb) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${fb.first_name} ${fb.last_name}</td>
        <td>${fb.rating}</td>
        <td>${fb.feedback_type}</td>
        <td>${fb.feedback_text}</td>
        <td>${fb.date_submitted}</td>
      `;
      feedbackSummaryTable.appendChild(row);
    });
  }

  reportContent.style.display = 'block';
}

// Show Reports and Analytics Section
function showReportsAnalytics() {
  if (!showSection('reports-analytics')) return;

  const reportContent = document.getElementById('report-content');
  if (!reportContent) {
    showError('Report content not found', 'reports-analytics');
    return;
  }

  reportContent.style.display = 'none';

  // Refresh data to ensure we have the latest information
  refreshReportData(() => {
    const employeeSearch = document.getElementById('employee-search');
    if (employeeSearch) {
      // Populate employee dropdown with all employees
      employeeSearch.innerHTML = '<option value="">Select an employee</option>';
      window.employees.forEach((emp) => {
        employeeSearch.innerHTML += `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`;
      });
    }

    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
      // Remove any existing listeners to prevent duplicates
      const newButton = generateReportBtn.cloneNode(true);
      generateReportBtn.parentNode.replaceChild(newButton, generateReportBtn);
      const updatedGenerateReportBtn = document.getElementById('generate-report-btn');

      updatedGenerateReportBtn.addEventListener('click', function () {
        const selectedEmployeeId = employeeSearch.value;
        if (!selectedEmployeeId) {
          alert('Please select an employee to generate the report.');
          return;
        }

        // Refresh data before generating the report
        refreshReportData(() => {
          // Repopulate the employee dropdown
          employeeSearch.innerHTML = '<option value="">Select an employee</option>';
          window.employees.forEach((emp) => {
            employeeSearch.innerHTML += `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`;
          });

          // Reselect the previously selected employee
          employeeSearch.value = selectedEmployeeId;

          // Generate the report for the selected employee
          generateReport(selectedEmployeeId);
        });
      });
    }

    // Initialize PDF download functionality
    const initializeDownloadPdf = () => {
      const downloadPdfBtn = document.getElementById('download-pdf-btn');
      if (downloadPdfBtn) {
        // Remove any existing click event listeners to prevent duplicates
        const newButton = downloadPdfBtn.cloneNode(true);
        downloadPdfBtn.parentNode.replaceChild(newButton, downloadPdfBtn);
        
        // Reassign the button reference
        const updatedDownloadPdfBtn = document.getElementById('download-pdf-btn');

        updatedDownloadPdfBtn.addEventListener('click', function () {
          const reportContent = document.getElementById('report-content');
          if (!reportContent) {
            showError(
              'Report content not found. Please generate the report first.',
              'reports-analytics'
            );
            return;
          }

          if (
            typeof html2canvas === 'undefined' ||
            typeof window.jspdf === 'undefined'
          ) {
            showError('PDF libraries not loaded.', 'reports-analytics');
            return;
          }

          updatedDownloadPdfBtn.style.display = 'none';
          html2canvas(reportContent, { scale: 2 })
            .then((canvas) => {
              const imgData = canvas.toDataURL('image/png');
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const imgWidth = pageWidth - 20;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              let position = 10;
              pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
              let remainingHeight = imgHeight;
              while (remainingHeight > pageHeight - 20) {
                pdf.addPage();
                position = 10;
                remainingHeight -= pageHeight - 20;
                pdf.addImage(
                  imgData,
                  'PNG',
                  10,
                  position - remainingHeight,
                  imgWidth,
                  imgHeight
                );
              }

              const employeeSearch = document.getElementById('employee-search');
              const selectedEmployee =
                employeeSearch.options[employeeSearch.selectedIndex].text;
              pdf.save(
                `Employee_Report_${selectedEmployee}_${new Date()
                  .toISOString()
                  .split('T')[0]}.pdf`
              );
              updatedDownloadPdfBtn.style.display = 'block';
            })
            .catch((error) => {
              showError(
                'Failed to generate PDF: ' + error.message,
                'reports-analytics'
              );
              updatedDownloadPdfBtn.style.display = 'block';
            });
        });
      }
    };

    if (
      typeof html2canvas !== 'undefined' &&
      typeof window.jspdf !== 'undefined'
    ) {
      initializeDownloadPdf();
    } else {
      const loadHtml2Canvas = new Promise((resolve, reject) => {
        if (typeof html2canvas !== 'undefined') return resolve();
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
          (error) => (error ? reject(error) : resolve())
        );
      });
      const loadJsPDF = new Promise((resolve, reject) => {
        if (typeof window.jspdf !== 'undefined') return resolve();
        loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
          (error) => (error ? reject(error) : resolve())
        );
      });
      Promise.all([loadHtml2Canvas, loadJsPDF])
        .then(initializeDownloadPdf)
        .catch((error) =>
          showError(
            'Failed to load PDF libraries: ' + error.message,
            'reports-analytics'
          )
        );
    }
  });
}

// Show Attendance Records Section
function showAttendanceRecords() {
  if (!showSection('attendance-records')) return;

  const fetchAttendanceBtn = document.getElementById('fetch-attendance-btn');
  const attendanceTableBody = document.getElementById('attendance-table-body');
  const employeeSearch = document.getElementById('attendance-employee-search');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (!fetchAttendanceBtn || !attendanceTableBody || !employeeSearch || !startDateInput || !endDateInput) {
    showError('Required elements not found', 'attendance-records');
    return;
  }

  // Clear table
  attendanceTableBody.innerHTML = '';

  // Remove existing listeners to prevent duplicates
  const newButton = fetchAttendanceBtn.cloneNode(true);
  fetchAttendanceBtn.parentNode.replaceChild(newButton, fetchAttendanceBtn);
  const updatedFetchAttendanceBtn = document.getElementById('fetch-attendance-btn');

  updatedFetchAttendanceBtn.addEventListener('click', function() {
    const employeeId = employeeSearch.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    fetch('superadmin_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=fetch_attendance&employee_id=${encodeURIComponent(employeeId)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          attendanceTableBody.innerHTML = '';
          if (data.attendance_records.length === 0) {
            attendanceTableBody.innerHTML = `<tr><td colspan="5">No attendance records found.</td></tr>`;
          } else {
            data.attendance_records.forEach(record => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${record.employee_name}</td>
                <td>${record.department_name}</td>
                <td>${record.check_in || 'N/A'}</td>
                <td>${record.check_out || 'N/A'}</td>
                <td>${record.status}</td>
              `;
              attendanceTableBody.appendChild(row);
            });
          }
        } else {
          showError(data.error || 'Failed to fetch attendance records', 'attendance-records');
        }
      })
      .catch(error => showError('Network error: ' + error.message, 'attendance-records'));
  });

  // Add sorting functionality
  const headers = document.querySelectorAll('#attendance-table th');
  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const rows = Array.from(attendanceTableBody.querySelectorAll('tr'));
      const isAscending = header.classList.contains('sort-asc');
      headers.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
        const icon = h.querySelector('i.fas');
        if (icon) icon.className = 'fas fa-sort';
      });

      header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
      const icon = header.querySelector('i.fas');
      if (icon) icon.className = isAscending ? 'fas fa-sort-down' : 'fas fa-sort-up';

      rows.sort((a, b) => {
        const aText = a.cells[index].textContent.trim();
        const bText = b.cells[index].textContent.trim();
        if (index === 2 || index === 3) { // Check In, Check Out (dates)
          const aDate = aText === 'N/A' ? 0 : new Date(aText).getTime();
          const bDate = bText === 'N/A' ? 0 : new Date(bText).getTime();
          return isAscending ? bDate - aDate : aDate - bDate;
        }
        return isAscending
          ? bText.localeCompare(aText)
          : aText.localeCompare(bText);
      });

      attendanceTableBody.innerHTML = '';
      rows.forEach(row => attendanceTableBody.appendChild(row));
    });
  });
}

// Show Leave Requests Section
function showLeaveRequests() {
  if (!showSection('leave-requests')) return;

  const fetchLeaveBtn = document.getElementById('fetch-leave-btn');
  const leaveTableBody = document.getElementById('leave-table-body');
  const leaveFilter = document.getElementById('leave-filter');

  if (!fetchLeaveBtn || !leaveTableBody || !leaveFilter) {
    showError('Required elements not found', 'leave-requests');
    return;
  }

  // Clear table
  leaveTableBody.innerHTML = '';

  // Remove existing listeners to prevent duplicates
  const newButton = fetchLeaveBtn.cloneNode(true);
  fetchLeaveBtn.parentNode.replaceChild(newButton, fetchLeaveBtn);
  const updatedFetchLeaveBtn = document.getElementById('fetch-leave-btn');

  function fetchLeaves() {
    const status = leaveFilter.value;
    fetch('superadmin_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=fetch_leave_applications&leave_filter=${encodeURIComponent(status)}`
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          leaveTableBody.innerHTML = '';
          if (data.leave_applications.length === 0) {
            leaveTableBody.innerHTML = `<tr><td colspan="6">No leave requests found.</td></tr>`;
          } else {
            data.leave_applications.forEach(request => {
              const row = document.createElement('tr');
              const statusClass = request.status === 'ispending' ? 'status-pending' :
                                request.status === 'approved' ? 'status-approved' : 'status-rejected';
              row.innerHTML = `
                <td>${request.employee_name}</td>
                <td>${request.leave_start_date}</td>
                <td>${request.leave_end_date}</td>
                <td>${request.leave_reason}</td>
                <td><span class="status-badge ${statusClass}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span></td>
                <td>
                  ${request.status === 'ispending' ? `
                    <form class="action-form approve-form" style="display:inline;">
                      <input type="hidden" name="request_id" value="${request.request_id}">
                      <button type="button" class="approve-btn" style="background-color:#4caf50;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;margin-right:5px;">Approve</button>
                    </form>
                    <form class="action-form reject-form" style="display:inline;">
                      <input type="hidden" name="request_id" value="${request.request_id}">
                      <button type="button" class="reject-btn" style="background-color:#f44336;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;">Reject</button>
                    </form>
                  ` : request.status === 'approved' || request.status === 'rejected' ? `
                    <button type="button" class="reconsider-btn" data-request-id="${request.request_id}">Reconsider</button>
                  ` : ''}
                </td>
              `;
              leaveTableBody.appendChild(row);

              // Add event listeners for approve/reject buttons
              if (request.status === 'ispending') {
                row.querySelector('.approve-btn').addEventListener('click', () => updateLeaveStatus(request.request_id, 'approved', fetchLeaves));
                row.querySelector('.reject-btn').addEventListener('click', () => updateLeaveStatus(request.request_id, 'rejected', fetchLeaves));
              }
              if (request.status === 'approved' || request.status === 'rejected') {
                row.querySelector('.reconsider-btn').addEventListener('click', () => reconsiderLeave(request.request_id, fetchLeaves));
              }
            });
          }
        } else {
          showError(data.error || 'Failed to fetch leave requests', 'leave-requests');
        }
      })
      .catch(error => showError('Network error: ' + error.message, 'leave-requests'));
  }

  // Initial fetch
  fetchLeaves();

  // Fetch on button click
  updatedFetchLeaveBtn.addEventListener('click', fetchLeaves);

  // Fetch on filter change
  leaveFilter.addEventListener('change', fetchLeaves);
}

// Function to update leave status
function updateLeaveStatus(requestId, status, callback) {
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=update_leave_status&request_id=${encodeURIComponent(requestId)}&status=${encodeURIComponent(status)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showSuccess(data.message, 'leave-requests');
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to update leave status', 'leave-requests');
      }
    })
    .catch(error => showError('Network error: ' + error.message, 'leave-requests'));
}

// Function to reconsider leave
function reconsiderLeave(requestId, callback) {
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=reconsider_leave&request_id=${encodeURIComponent(requestId)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showSuccess(data.message, 'leave-requests');
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to reconsider leave', 'leave-requests');
      }
    })
    .catch(error => showError('Network error: ' + error.message, 'leave-requests'));
}

// Function to load external scripts
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => callback();
  script.onerror = () => callback(new Error(`Failed to load script: ${url}`));
  document.head.appendChild(script);
}

// Placeholder for Create User Form
function showCreateUserForm() {
  if (!showSection('create-user-form')) return;

  const contentArea = document.getElementById('create-user-form');
  contentArea.innerHTML = `
    <div class="card">
      <h2>Create New User</h2>
      <p>Functionality to create a new user profile will be implemented here.</p>
      <div class="form-group button-group">
        <button type="button" onclick="showWelcomeMessage()">Back</button>
      </div>
    </div>
  `;
}

// Toggle dropdown menu without hiding sidebar text
function toggleDropdown(event, dropdownId) {
  event.preventDefault();
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    const isDisplayed = dropdown.style.display === 'block';
    dropdown.style.display = isDisplayed ? 'none' : 'block';
    dropdown.classList.toggle('show', !isDisplayed);
  }
}

// Show welcome message (default view)
function showWelcomeMessage() {
  showSection('main-content');
}

// Initialize sidebar event listeners
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.sidebar-menu a').forEach((link) => {
    link.addEventListener('click', function (event) {
      const action = this.getAttribute('onclick');
      if (action && typeof window[action] === 'function') {
        event.preventDefault();
        window[action]();
      }
    });
  });
});