// superadmin_dashboard.js

// Reset all sections
function resetAllSections() {
  const sections = [
    'main-content',
    'create-user-form',
    'attendance-records',
    'leave-requests',
    'department-metrics',
    'profile-update-form',
    'reports-analytics',
    'project-task-content',
  ];
  sections.forEach((sectionId) => {
    document.getElementById(sectionId).style.display = 'none';
  });

  // Reset report sections
  const reportSections = [
    'avg-ratings-section',
    'feedback-types-section',
    'work-summary-section',
    'training-certificates-section',
    'feedback-summary-section',
  ];
  reportSections.forEach((sectionId) => {
    document.getElementById(sectionId).style.display = 'none';
  });

  // Reset project/task sections
  const projectTaskSections = [
    'project-overview-section',
    'project-budget-section',
    'task-assignments-section',
    'training-overview-section',
  ];
  projectTaskSections.forEach((sectionId) => {
    document.getElementById(sectionId).style.display = 'none';
  });
}

// Show Welcome Message (Main Dashboard)
function showWelcomeMessage() {
  resetAllSections();
  document.getElementById('main-content').style.display = 'block';
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
    body: 'action=refresh_data&section=reports',
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
  const feedbackSummaryTable = document.getElementById(
    'feedback-summary-table'
  );
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
  resetAllSections();
  document.getElementById('reports-analytics').style.display = 'block';
  document.getElementById('report-content').style.display = 'none';
}

// Show Create User Form
function showCreateUserForm() {
  resetAllSections();
  document.getElementById('create-user-form').style.display = 'block';
}

// Show Project Overview
function showProjectOverview() {
  resetAllSections();
  document.getElementById('project-task-content').style.display = 'block';
  document.getElementById('project-overview-section').style.display = 'block';
  renderProjectOverview();

  // Add filter event listener
  document.getElementById('project-status-filter').onchange = () =>
    renderProjectOverview();
}

// Show Project Budget
function showProjectBudget() {
  resetAllSections();
  document.getElementById('project-task-content').style.display = 'block';
  document.getElementById('project-budget-section').style.display = 'block';
  renderProjectBudget();

  // Add filter event listener
  document.getElementById('budget-status-filter').onchange = () =>
    renderProjectBudget();
}

// Show Task Assignments
function showTaskAssignments() {
  resetAllSections();
  document.getElementById('project-task-content').style.display = 'block';
  document.getElementById('task-assignments-section').style.display = 'block';
  renderTaskAssignments();
  renderWorkloadSummary();
}

// Render Project Overview
function renderProjectOverview() {
  const projectTable = document.getElementById('project-overview-table');
  const statusFilter = document.getElementById('project-status-filter').value;
  const currentDate = new Date();

  let overdueCount = 0;
  const filteredProjects = projects.filter(
    (project) => !statusFilter || project.project_status === statusFilter
  );

  projectTable.innerHTML = '';
  filteredProjects.forEach((project) => {
    const expectedEndDate = new Date(project.expected_end_date);
    const isOverdue =
      expectedEndDate < currentDate && project.project_status !== 'Completed';
    if (isOverdue) overdueCount++;

    const rowStyle = isOverdue ? 'style="background-color: #ffcccc;"' : '';
    projectTable.innerHTML += `
          <tr ${rowStyle}>
              <td>${project.project_name}</td>
              <td>${project.project_status}</td>
              <td>${project.start_date}</td>
              <td>${project.expected_end_date}</td>
              <td>${project.department_name}</td>
          </tr>
      `;
  });

  // Update summary
  document.getElementById('total-projects').textContent =
    filteredProjects.length;
  document.getElementById('overdue-projects').textContent = overdueCount;
}

// Render Project Budget
function renderProjectBudget() {
  const projectTable = document.getElementById('project-budget-table');
  const statusFilter = document.getElementById('budget-status-filter').value;
  const currentDate = new Date();

  let overBudgetCount = 0;
  let highRiskCount = 0;
  const filteredProjects = projects.filter(
    (project) => !statusFilter || project.project_status === statusFilter
  );

  projectTable.innerHTML = '';
  filteredProjects.forEach((project) => {
    const expectedEndDate = new Date(project.expected_end_date);
    const actualCost = parseFloat(project.actual_cost || 0);
    const budget = parseFloat(project.budget);
    const costDifference = actualCost - budget;
    const isOverBudget = actualCost > budget;
    const isOverdue =
      expectedEndDate < currentDate && project.project_status !== 'Completed';
    const isHighRisk = isOverBudget && isOverdue;

    if (isOverBudget) overBudgetCount++;
    if (isHighRisk) highRiskCount++;

    let rowStyle = '';
    if (isHighRisk) rowStyle = 'style="background-color: #ff9999;"';
    // High risk: overdue + over budget
    else if (isOverBudget)
      rowStyle = 'style="background-color: #ffcc99;"'; // Over budget
    else if (isOverdue) rowStyle = 'style="background-color: #ffcccc;"'; // Overdue

    projectTable.innerHTML += `
          <tr ${rowStyle}>
              <td>${project.project_name}</td>
              <td>${project.project_status}</td>
              <td>$${budget.toFixed(2)}</td>
              <td>$${actualCost.toFixed(2)}</td>
              <td>$${costDifference.toFixed(2)}</td>
              <td>${project.expected_end_date}</td>
          </tr>
      `;
  });

  // Update summary
  document.getElementById('total-budget-projects').textContent =
    filteredProjects.length;
  document.getElementById('over-budget-projects').textContent = overBudgetCount;
  document.getElementById('high-risk-projects').textContent = highRiskCount;
}

// Render Task Assignments
function renderTaskAssignments() {
  const taskTable = document.getElementById('task-assignments-table');
  taskTable.innerHTML = '';

  const groupedTasks = groupTasksByEmployee();

  Object.keys(groupedTasks).forEach((employee) => {
    const employeeData = groupedTasks[employee];
    const tasks = employeeData.tasks;
    const subtaskCount = employeeData.subtaskCount;
    const isHeavyWorkload = subtaskCount > 5;
    const rowClass = isHeavyWorkload ? 'heavy-workload' : '';
    const rowTitle = isHeavyWorkload
      ? `title="Heavy Workload: ${subtaskCount} subtasks assigned"`
      : '';

    let taskList = '<table class="nested-table">';
    taskList +=
      '<thead><tr><th>Task Description</th><th>Project</th><th>Status</th><th>Due Date</th></tr></thead><tbody>';
    tasks.forEach((task) => {
      const taskClass = task.isOverdue
        ? 'class="overdue" title="Overdue: Due date ' +
          task.due_date +
          ' passed and status is not Done"'
        : '';
      taskList += `
              <tr ${taskClass}>
                  <td>${task.task_description}</td>
                  <td>${task.project_name}</td>
                  <td>${task.status}</td>
                  <td>${task.due_date || 'N/A'}</td>
              </tr>
          `;
    });
    taskList += '</tbody></table>';

    taskTable.innerHTML += `
          <tr class="${rowClass}" ${rowTitle}>
              <td>${employee}</td>
              <td>${taskList}</td>
              <td>${subtaskCount}</td>
          </tr>
      `;
  });
}

// Group tasks by employee
function groupTasksByEmployee() {
  const groupedTasks = {};
  const currentDate = new Date();

  taskAssignments.forEach((task) => {
    const employeeKey = `${task.first_name} ${task.last_name}`;
    if (!groupedTasks[employeeKey]) {
      groupedTasks[employeeKey] = {
        employee_id: task.employee_id,
        tasks: [],
        subtaskCount: 0,
      };
    }
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const isOverdue =
      dueDate && dueDate < currentDate && task.status !== 'Done';
    groupedTasks[employeeKey].tasks.push({ ...task, isOverdue });
    groupedTasks[employeeKey].subtaskCount++;
  });

  return groupedTasks;
}

// Render Workload Summary
function renderWorkloadSummary() {
  const workloadTable = document.getElementById('workload-table');
  workloadTable.innerHTML = '';

  if (!Array.isArray(subtaskCounts) || subtaskCounts.length === 0) {
    workloadTable.innerHTML = `
          <tr>
              <td colspan="2">No subtask data available.</td>
          </tr>
      `;
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
      const updatedGenerateReportBtn = document.getElementById(
        'generate-report-btn'
      );

      updatedGenerateReportBtn.addEventListener('click', function () {
        const selectedEmployeeId = employeeSearch.value;
        if (!selectedEmployeeId) {
          alert('Please select an employee to generate the report.');
          return;
        }

        // Refresh data before generating the report
        refreshReportData(() => {
          // Repopulate the employee dropdown
          employeeSearch.innerHTML =
            '<option value="">Select an employee</option>';
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
        const updatedDownloadPdfBtn =
          document.getElementById('download-pdf-btn');

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
                `Employee_Report_${selectedEmployee}_${
                  new Date().toISOString().split('T')[0]
                }.pdf`
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

  if (
    !fetchAttendanceBtn ||
    !attendanceTableBody ||
    !employeeSearch ||
    !startDateInput ||
    !endDateInput
  ) {
    showError('Required elements not found', 'attendance-records');
    return;
  }

  // Clear table
  attendanceTableBody.innerHTML = '';

  // Remove existing listeners to prevent duplicates
  const newButton = fetchAttendanceBtn.cloneNode(true);
  fetchAttendanceBtn.parentNode.replaceChild(newButton, fetchAttendanceBtn);
  const updatedFetchAttendanceBtn = document.getElementById(
    'fetch-attendance-btn'
  );

  updatedFetchAttendanceBtn.addEventListener('click', function () {
    const employeeId = employeeSearch.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    fetch('superadmin_dashboard.php', {
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
        if (data.success) {
          attendanceTableBody.innerHTML = '';
          if (data.attendance_records.length === 0) {
            attendanceTableBody.innerHTML = `<tr><td colspan="5">No attendance records found.</td></tr>`;
          } else {
            data.attendance_records.forEach((record) => {
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
          showError(
            data.error || 'Failed to fetch attendance records',
            'attendance-records'
          );
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'attendance-records')
      );
  });

  // Add sorting functionality
  const headers = document.querySelectorAll('#attendance-table th');
  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const rows = Array.from(attendanceTableBody.querySelectorAll('tr'));
      const isAscending = header.classList.contains('sort-asc');
      headers.forEach((h) => {
        h.classList.remove('sort-asc', 'sort-desc');
        const icon = h.querySelector('i.fas');
        if (icon) icon.className = 'fas fa-sort';
      });

      header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
      const icon = header.querySelector('i.fas');
      if (icon)
        icon.className = isAscending ? 'fas fa-sort-down' : 'fas fa-sort-up';

      rows.sort((a, b) => {
        const aText = a.cells[index].textContent.trim();
        const bText = b.cells[index].textContent.trim();
        if (index === 2 || index === 3) {
          // Check In, Check Out (dates)
          const aDate = aText === 'N/A' ? 0 : new Date(aText).getTime();
          const bDate = bText === 'N/A' ? 0 : new Date(bText).getTime();
          return isAscending ? bDate - aDate : aDate - bDate;
        }
        return isAscending
          ? bText.localeCompare(aText)
          : aText.localeCompare(bText);
      });

      attendanceTableBody.innerHTML = '';
      rows.forEach((row) => attendanceTableBody.appendChild(row));
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
      body: `action=fetch_leave_applications&leave_filter=${encodeURIComponent(
        status
      )}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          leaveTableBody.innerHTML = '';
          if (data.leave_applications.length === 0) {
            leaveTableBody.innerHTML = `<tr><td colspan="6">No leave requests found.</td></tr>`;
          } else {
            data.leave_applications.forEach((request) => {
              const row = document.createElement('tr');
              const statusClass =
                request.status === 'ispending'
                  ? 'status-pending'
                  : request.status === 'approved'
                  ? 'status-approved'
                  : 'status-rejected';
              row.innerHTML = `
                <td>${request.employee_name}</td>
                <td>${request.leave_start_date}</td>
                <td>${request.leave_end_date}</td>
                <td>${request.leave_reason}</td>
                <td><span class="status-badge ${statusClass}">${
                request.status.charAt(0).toUpperCase() + request.status.slice(1)
              }</span></td>
                <td>
                  ${
                    request.status === 'ispending'
                      ? `
                    <form class="action-form approve-form" style="display:inline;">
                      <input type="hidden" name="request_id" value="${request.request_id}">
                      <button type="button" class="approve-btn" style="background-color:#4caf50;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;margin-right:5px;">Approve</button>
                    </form>
                    <form class="action-form reject-form" style="display:inline;">
                      <input type="hidden" name="request_id" value="${request.request_id}">
                      <button type="button" class="reject-btn" style="background-color:#f44336;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;">Reject</button>
                    </form>
                  `
                      : request.status === 'approved' ||
                        request.status === 'rejected'
                      ? `
                    <button type="button" class="reconsider-btn" data-request-id="${request.request_id}">Reconsider</button>
                  `
                      : ''
                  }
                </td>
              `;
              leaveTableBody.appendChild(row);

              // Add event listeners for approve/reject buttons
              if (request.status === 'ispending') {
                row
                  .querySelector('.approve-btn')
                  .addEventListener('click', () =>
                    updateLeaveStatus(
                      request.request_id,
                      'approved',
                      fetchLeaves
                    )
                  );
                row
                  .querySelector('.reject-btn')
                  .addEventListener('click', () =>
                    updateLeaveStatus(
                      request.request_id,
                      'rejected',
                      fetchLeaves
                    )
                  );
              }
              if (
                request.status === 'approved' ||
                request.status === 'rejected'
              ) {
                row
                  .querySelector('.reconsider-btn')
                  .addEventListener('click', () =>
                    reconsiderLeave(request.request_id, fetchLeaves)
                  );
              }
            });
          }
        } else {
          showError(
            data.error || 'Failed to fetch leave requests',
            'leave-requests'
          );
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'leave-requests')
      );
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
    body: `action=update_leave_status&request_id=${encodeURIComponent(
      requestId
    )}&status=${encodeURIComponent(status)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccess(data.message, 'leave-requests');
        if (callback) callback();
      } else {
        showError(
          data.error || 'Failed to update leave status',
          'leave-requests'
        );
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'leave-requests')
    );
}

// Function to reconsider leave
function reconsiderLeave(requestId, callback) {
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=reconsider_leave&request_id=${encodeURIComponent(requestId)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccess(data.message, 'leave-requests');
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to reconsider leave', 'leave-requests');
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'leave-requests')
    );
}

// Show Department-wise Performance Metrics Section
function showDepartmentMetrics() {
  if (!showSection('department-metrics')) return;

  const metricsTableBody = document.getElementById(
    'department-metrics-table-body'
  );

  if (!metricsTableBody) {
    showError('Required elements not found', 'department-metrics');
    return;
  }

  // Clear table
  metricsTableBody.innerHTML = '';

  // Fetch department metrics
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=fetch_department_metrics',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        metricsTableBody.innerHTML = '';
        if (data.department_metrics.length === 0) {
          metricsTableBody.innerHTML = `<tr><td colspan="9">No department metrics found.</td></tr>`;
        } else {
          data.department_metrics.forEach((metric) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${metric.department_name}</td>
              <td>${metric.employee_count}</td>
              <td>${metric.projects_completed}</td>
              <td>${metric.projects_in_progress}</td>
              <td>${metric.projects_assigned}</td>
              <td>${metric.tasks_completed}</td>
              <td>${metric.trainings_conducted}</td>
              <td>${metric.avg_feedback_rating}</td>
              <td>${metric.total_leaves_taken}</td>
            `;
            metricsTableBody.appendChild(row);
          });
        }
      } else {
        showError(
          data.error || 'Failed to fetch department metrics',
          'department-metrics'
        );
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'department-metrics')
    );

  // Add sorting functionality
  const headers = document.querySelectorAll('#department-metrics-table th');
  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const rows = Array.from(metricsTableBody.querySelectorAll('tr'));
      const isAscending = header.classList.contains('sort-asc');
      headers.forEach((h) => {
        h.classList.remove('sort-asc', 'sort-desc');
        const icon = h.querySelector('i.fas');
        if (icon) icon.className = 'fas fa-sort';
      });

      header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
      const icon = header.querySelector('i.fas');
      if (icon)
        icon.className = isAscending ? 'fas fa-sort-down' : 'fas fa-sort-up';

      rows.sort((a, b) => {
        let aText = a.cells[index].textContent.trim();
        let bText = b.cells[index].textContent.trim();
        // Convert to numbers for numeric columns
        if (index !== 0) {
          // All columns except Department Name are numeric
          aText = parseFloat(aText) || 0;
          bText = parseFloat(bText) || 0;
          return isAscending ? bText - aText : aText - bText;
        }
        return isAscending
          ? bText.localeCompare(aText)
          : aText.localeCompare(bText);
      });

      metricsTableBody.innerHTML = '';
      rows.forEach((row) => metricsTableBody.appendChild(row));
    });
  });
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
  subtaskCounts.forEach((employee) => {
    const subtaskCount = parseInt(employee.subtask_count) || 0;
    const isHeavyWorkload = subtaskCount > 5;
    const rowStyle = isHeavyWorkload
      ? 'class="heavy-workload" title="Heavy Workload: ' +
        subtaskCount +
        ' subtasks assigned"'
      : '';
    workloadTable.innerHTML += `
          <tr ${rowStyle}>
              <td>${employee.first_name} ${employee.last_name}</td>
              <td>${subtaskCount}</td>
          </tr>
      `;
  });
}

// Render Training Overview
function renderTrainingOverview() {
  const trainingTable = document.getElementById('training-overview-table');
  trainingTable.innerHTML = '';
  trainingOverview.forEach((training) => {
    trainingTable.innerHTML += `
          <tr>
              <td>${training.training_name}</td>
              <td>${training.training_date}</td>
              <td>${training.end_date || 'N/A'}</td>
              <td>${training.certificate || 'None'}</td>
              <td>${training.enrolled_count}</td>
              <td>${
                training.avg_score
                  ? parseFloat(training.avg_score).toFixed(2)
                  : 'N/A'
              }</td>
          </tr>
      `;
  });
}

// Generate Report Button (Show All Reports Sections)
document.getElementById('generate-report-btn').addEventListener('click', () => {
  const employeeId = document.getElementById('employee-search').value;
  showReportsAnalytics();
  document.getElementById('report-content').style.display = 'block';

  document.getElementById('avg-ratings-section').style.display = 'block';
  const avgRatingsTable = document.getElementById('avg-ratings-table');
  avgRatingsTable.innerHTML = '';
  reportAvgRatings
    .filter((r) => !employeeId || r.employee_id == employeeId)
    .forEach((rating) => {
      avgRatingsTable.innerHTML += `
              <tr>
                  <td>${rating.first_name} ${rating.last_name}</td>
                  <td>${parseFloat(rating.avg_rating).toFixed(2)}</td>
                  <td>${rating.feedback_count}</td>
              </tr>
          `;
    });

  document.getElementById('feedback-types-section').style.display = 'block';
  const feedbackTypesTable = document.getElementById('feedback-types-table');
  feedbackTypesTable.innerHTML = '';
  reportFeedbackTypes.forEach((type) => {
    feedbackTypesTable.innerHTML += `
          <tr>
              <td>${type.feedback_type}</td>
              <td>${type.type_count}</td>
          </tr>
      `;
  });

  document.getElementById('work-summary-section').style.display = 'block';
  const workSummaryTable = document.getElementById('work-summary-table');
  workSummaryTable.innerHTML = '';
  projectAssignments
    .filter((a) => !employeeId || a.employee_id == employeeId)
    .forEach((assignment) => {
      workSummaryTable.innerHTML += `
              <tr>
                  <td>Project Assignment</td>
                  <td>${assignment.project_name} (${assignment.role_in_project})</td>
              </tr>
          `;
    });

  document.getElementById('training-certificates-section').style.display =
    'block';
  const trainingTable = document.getElementById('training-certificates-table');
  trainingTable.innerHTML = '';
  employeeTrainings
    .filter((t) => !employeeId || t.employee_id == employeeId)
    .forEach((training) => {
      trainingTable.innerHTML += `
              <tr>
                  <td>${training.training_name}</td>
                  <td>${training.training_date}</td>
                  <td>${training.certificate || 'None'}</td>
                  <td>${training.score || 'N/A'}</td>
              </tr>
          `;
    });

  document.getElementById('feedback-summary-section').style.display = 'block';
  const feedbackTable = document.getElementById('feedback-summary-table');
  feedbackTable.innerHTML = '';
  feedback
    .filter((f) => !employeeId || f.employee_id == employeeId)
    .forEach((f) => {
      feedbackTable.innerHTML += `
              <tr>
                  <td>${f.first_name} ${f.last_name}</td>
                  <td>${f.rating}</td>
                  <td>${f.feedback_type}</td>
                  <td>${f.feedback_text}</td>
                  <td>${f.date_submitted}</td>
              </tr>
          `;
    });
});

// Download PDF Button
document.getElementById('download-pdf-btn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const reportContent = document.getElementById('report-content');

  html2canvas(reportContent).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save('report.pdf');
  });
});

// Toggle Dropdown for Sidebar
function toggleDropdown(event, dropdownId) {
  event.preventDefault();
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    const isDisplayed = dropdown.style.display === 'block';
    // Hide all other dropdowns
    document
      .querySelectorAll('.dropdown')
      .forEach((d) => (d.style.display = 'none'));
    // Toggle the current dropdown
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

function validateForm(event, form) {
  console.log('validateForm called');

  // Validate Date of Birth (DOB)
  const dobInput = form.querySelector('#dob');
  if (!dobInput || !dobInput.value) {
    console.error('DOB input not found or empty');
    showError('Please enter a valid date of birth.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  const dobValue = new Date(dobInput.value);
  const currentDate = new Date();
  if (isNaN(dobValue.getTime())) {
    console.error('Invalid DOB value:', dobInput.value);
    showError('Please enter a valid date of birth.', 'profile-update-form');
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
    showError('You must be at least 18 years old.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  // Validate Hire Date
  const hireDateInput = form.querySelector('#emp_hire_date');
  if (!hireDateInput || !hireDateInput.value) {
    console.error('Hire date input not found or empty');
    showError('Please enter a valid hire date.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  const hireDateValue = new Date(hireDateInput.value);
  if (isNaN(hireDateValue.getTime())) {
    console.error('Invalid hire date value:', hireDateInput.value);
    showError('Please enter a valid hire date.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  if (hireDateValue > currentDate) {
    console.log('Hire date validation failed: Hire date is in the future');
    showError('Hire date cannot be in the future.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  // Validate Salary
  const salaryInput = form.querySelector('#salary');
  if (!salaryInput || !salaryInput.value) {
    console.error('Salary input not found or empty');
    showError('Please enter a valid salary.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  const salaryValue = parseFloat(salaryInput.value);
  if (isNaN(salaryValue) || salaryValue <= 0) {
    console.log('Salary validation failed: Invalid salary');
    showError('Salary must be a positive number.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  // Validate Job Title
  const jobTitleInput = form.querySelector('#emp_job_title');
  if (!jobTitleInput || !jobTitleInput.value) {
    console.error('Job title input not found or empty');
    showError('Please enter a valid job title.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  const jobTitlePattern = /^[A-Za-z ]+$/;
  if (!jobTitlePattern.test(jobTitleInput.value)) {
    console.log('Job title validation failed: Invalid characters');
    showError(
      'Job title must contain only letters and spaces.',
      'profile-update-form'
    );
    event.preventDefault();
    return false;
  }

  // Validate Department
  const departmentInput = form.querySelector('#department_id');
  if (!departmentInput || departmentInput.value === '') {
    console.log('Department validation failed: No department selected');
    showError('Please select a department.', 'profile-update-form');
    event.preventDefault();
    return false;
  }

  console.log('All validations passed');
  return true;
}

function showCreateUserForm() {
  console.log('showCreateUserForm called');
  if (!showSection('create-user-form')) return;

  const profileUpdateForm = document.getElementById('create-user-form');
  if (!profileUpdateForm) {
    showError('create-user-form not found.', 'create-user-form');
    return;
  }

  // Use superAdminEmployees if available (Super Admin dashboard), otherwise fall back to employees (HR dashboard)
  const employeeList =
    typeof superAdminEmployees !== 'undefined'
      ? superAdminEmployees
      : employees;

  // Get valid department IDs (convert to strings for comparison)
  const validDepartmentIds = departments.map((dept) =>
    String(dept.department_id)
  );

  // Filter employees to get only managers with valid department_id
  const managers = employeeList.filter(
    (emp) =>
      emp.role === 'Manager' &&
      emp.emp_status !== 'Inactive' &&
      emp.department_id !== null &&
      emp.department_id !== undefined &&
      validDepartmentIds.includes(String(emp.department_id))
  );

  // Log managers for debugging
  console.log('Filtered managers:', managers);

  profileUpdateForm.innerHTML = `
    <div class="card">
      <h2>Create New User</h2>
      <form id="createUserForm">
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
          <label for="emp_job_title">Job Title:</label>
          <input type="text" id="emp_job_title" name="emp_job_title" required 
                 pattern="[A-Za-z ]+" 
                 title="Job title must contain only letters and spaces" 
                 onkeypress="return (event.charCode >= 65 && event.charCode <= 90) || (event.charCode >= 97 && event.charCode <= 122) || event.charCode === 32">
        </div>
        <div class="form-group">
          <label for="role">Role:</label>
          <select id="role" name="role" required>
            <option value="">Select Role</option>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR</option>
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
          <label for="department_id_display">Department:</label>
          <select id="department_id_display" disabled>
            <option value="">Select a department</option>
            ${departments
              .map(
                (dept) =>
                  `<option value="${dept.department_id}">${dept.department_name}</option>`
              )
              .join('')}
          </select>
          <input type="hidden" id="department_id" name="department_id" value="">
        </div>
        <div class="form-group button-group">
          <button type="submit">Create User</button>
          <button type="button" onclick="showWelcomeMessage(event)">Back</button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('createUserForm');
  const roleSelect = document.getElementById('role');
  const assignManagerGroup = document.getElementById('assign-manager-group');
  const departmentGroup = document.getElementById('department-group');
  const departmentDisplaySelect = document.getElementById(
    'department_id_display'
  );
  const departmentHiddenInput = document.getElementById('department_id');
  const managerSelect = document.getElementById('manager_id');

  if (
    form &&
    roleSelect &&
    assignManagerGroup &&
    departmentGroup &&
    departmentDisplaySelect &&
    departmentHiddenInput &&
    managerSelect
  ) {
    roleSelect.addEventListener('change', function () {
      assignManagerGroup.style.display = 'none';
      managerSelect.value = '';
      departmentDisplaySelect.disabled = false;
      departmentDisplaySelect.value = '';
      departmentHiddenInput.value = '';

      if (this.value === 'User') {
        assignManagerGroup.style.display = 'block';
        departmentDisplaySelect.disabled = true;
        departmentDisplaySelect.value = '';
        departmentHiddenInput.value = '';
      } else if (this.value === 'Manager') {
        assignManagerGroup.style.display = 'none';
        departmentDisplaySelect.disabled = false;
        departmentDisplaySelect.value = '';
        departmentHiddenInput.value = '';
      } else if (this.value === 'HR') {
        assignManagerGroup.style.display = 'none';
        // Automatically set department to HR Department (D02)
        const hrDepartment = departments.find(
          (dept) => dept.department_id === 'D02'
        );
        if (hrDepartment) {
          departmentDisplaySelect.value = 'D02';
          departmentHiddenInput.value = 'D02';
          departmentDisplaySelect.disabled = true;
        } else {
          showError(
            'HR Department (D02) not found in departments list.',
            'profile-update-form'
          );
          departmentDisplaySelect.disabled = false;
          departmentDisplaySelect.value = '';
          departmentHiddenInput.value = '';
        }
      } else {
        assignManagerGroup.style.display = 'none';
        departmentDisplaySelect.disabled = true;
        departmentDisplaySelect.value = '';
        departmentHiddenInput.value = '';
      }
    });

    managerSelect.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex];
      const managerDepartmentId =
        selectedOption.getAttribute('data-department-id');
      console.log('Selected manager ID:', this.value);
      console.log('Manager department ID:', managerDepartmentId);
      if (
        managerDepartmentId &&
        validDepartmentIds.includes(String(managerDepartmentId))
      ) {
        departmentDisplaySelect.value = managerDepartmentId;
        departmentHiddenInput.value = managerDepartmentId;
        departmentDisplaySelect.disabled = true;
      } else {
        departmentDisplaySelect.value = '';
        departmentHiddenInput.value = '';
        departmentDisplaySelect.disabled = true;
        showError(
          'Selected manager does not have a valid department assigned. Please assign a department to the manager first.',
          'profile-update-form'
        );
      }
    });

    departmentDisplaySelect.addEventListener('change', function () {
      departmentHiddenInput.value = this.value;
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission

      // Log form data for debugging
      const formData = new FormData(this);
      console.log('Form data on submit:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Run the validateForm function first
      if (!validateForm(event, this)) {
        return;
      }

      // Additional validations specific to showCreateUserForm
      if (roleSelect.value === 'User' && !managerSelect.value) {
        showError(
          'Please select a manager for the user.',
          'profile-update-form'
        );
        return;
      }

      if (roleSelect.value === 'User') {
        const selectedOption =
          managerSelect.options[managerSelect.selectedIndex];
        const managerDepartmentId =
          selectedOption.getAttribute('data-department-id');
        if (
          managerDepartmentId &&
          validDepartmentIds.includes(String(managerDepartmentId))
        ) {
          departmentHiddenInput.value = managerDepartmentId;
        } else {
          showError(
            'Manager does not have a valid department assigned.',
            'profile-update-form'
          );
          return;
        }
      }

      if (roleSelect.value === 'HR') {
        // Ensure department is set to D02 for HR role
        const hrDepartment = departments.find(
          (dept) => dept.department_id === 'D02'
        );
        if (hrDepartment) {
          departmentHiddenInput.value = 'D02';
        } else {
          showError(
            'HR Department (D02) not found. Cannot create HR user.',
            'profile-update-form'
          );
          return;
        }
      }

      if (!departmentHiddenInput.value) {
        showError('Please select a department.', 'profile-update-form');
        return;
      }

      // Add loading state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = 'Creating...';

      // Submit the form via AJAX
      fetch('../pages/features/create_user_admin.php', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Create User';
          if (data.success) {
            showSuccess('User created successfully!', 'profile-update-form');
            // Reset the form to allow creating another user
            form.reset();
            // Reset role-specific UI elements
            assignManagerGroup.style.display = 'none';
            managerSelect.value = '';
            departmentDisplaySelect.disabled = false;
            departmentDisplaySelect.value = '';
            departmentHiddenInput.value = '';
            roleSelect.value = '';
          } else {
            showError(data.error || 'Unknown error', 'profile-update-form');
          }
        })
        .catch((error) => {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Create User';
          console.error('Error submitting form:', error);
          showError(
            'An error occurred while creating the user. Please try again.',
            'profile-update-form'
          );
        });
    });
  } else {
    console.error(
      'createUserForm, role select, assign-manager-group, department-group, department select, or manager select not found after rendering'
    );
    showError('Form setup error.', 'profile-update-form');
  }
}
