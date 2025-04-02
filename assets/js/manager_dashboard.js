// manager_dashboard.js
// Refresh data from server
function refreshData(callback) {
  fetch('manager_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.employees = data.employees || employees;
        window.feedback = data.feedback || feedback;
        window.reportAvgRatings = data.report_avg_ratings || reportAvgRatings;
        window.reportFeedbackTypes =
          data.report_feedback_types || reportFeedbackTypes;
        window.projects = data.projects || projects;
        window.tasks = data.tasks || tasks;
        if (callback) callback();
      } else {
        showError(data.error || 'Failed to refresh data');
      }
    })
    .catch((error) => showError('Network error: ' + error.message));
}

function showWelcomeMessage(event) {
  if (event) event.preventDefault();
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    profileUpdateForm.innerHTML = '';
  }
}

function showProfileForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';

    if (employees.length === 0) {
      profileUpdateForm.innerHTML = `
              <h2>Employees Assigned to Me</h2>
              <p>No employees are currently assigned to you.</p>
              <div class="form-group button-group">
                  <button type="button" onclick="showWelcomeMessage(event)">Back</button>
              </div>
          `;
      return;
    }

    let employeesTableHTML = `
          <h2>Employees Assigned to Me</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-sizing: border-box;">
              <thead>
                  <tr style="background-color: #003087; color: #FFFFFF;">
                      <th style="padding: 10px; text-align: center; box-sizing: border-box;">Employee Name</th>
                      <th style="padding: 10px; text-align: center; box-sizing: border-box;">Job Title</th>
                      <th style="padding: 10px; text-align: center; box-sizing: border-box;">Email</th>
                      <th style="padding: 10px; text-align: center; box-sizing: border-box;">Status</th>
                  </tr>
              </thead>
              <tbody>
      `;

    employees.forEach((emp) => {
      employeesTableHTML += `
              <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    emp.first_name
                  } ${emp.last_name}</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    emp.emp_job_title || 'N/A'
                  }</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    emp.email || 'N/A'
                  }</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    emp.emp_status || 'N/A'
                  }</td>
              </tr>
          `;
    });

    employeesTableHTML += `
              </tbody>
          </table>
          <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
              <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                      onmouseover="this.style.backgroundColor='#5a6268'" 
                      onmouseout="this.style.backgroundColor='#6c757d'"
                      onclick="showWelcomeMessage(event)">Back</button>
          </div>
      `;

    profileUpdateForm.innerHTML = employeesTableHTML;
  }
}

function showFeedbackForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    if (employees.length === 0) {
      profileUpdateForm.innerHTML = `
              <h2>Give Feedback to Employee</h2>
              <p>No employees assigned to you.</p>
              <div class="form-group button-group">
                  <button type="button" onclick="showWelcomeMessage(event)">Back</button>
              </div>
          `;
      return;
    }
    profileUpdateForm.innerHTML = `
          <h2>Give Feedback to Employee</h2>
          <form id="feedbackForm" method="POST">
              <div class="form-group">
                  <label for="employee_id">Employee:</label>
                  <select id="employee_id" name="employee_id" required>
                      <option value="">Select an employee</option>
                      ${employees
                        .map(
                          (emp) =>
                            `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name} (${emp.emp_job_title})</option>`
                        )
                        .join('')}
                  </select>
              </div>
              <div class="form-group">
                  <label for="rating">Rating (1-5):</label>
                  <input type="number" id="rating" name="rating" min="1" max="5" required>
              </div>
              <div class="form-group">
                  <label for="feedback_type">Feedback Type:</label>
                  <select id="feedback_type" name="feedback_type" required>
                      <option value="Performance">Performance</option>
                      <option value="Behavior">Behavior</option>
                      <option value="Project">Project</option>
                      <option value="Other">Other</option>
                  </select>
              </div>
              <div class="form-group">
                  <label for="feedback_text">Feedback Details:</label>
                  <textarea id="feedback_text" name="feedback_text" rows="4" required></textarea>
              </div>
              <div class="form-group button-group">
                  <button type="submit">Submit Feedback</button>
                  <button type="button" onclick="showWelcomeMessage(event)">Back</button>
              </div>
          </form>
      `;
    const form = document.getElementById('feedbackForm');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validateFeedbackForm(this)) return;

        fetch('../pages/features/manage_feedback.php', {
          method: 'POST',
          body: new FormData(this),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              refreshData(showFeedbackHistory);
            } else {
              showError(data.error || 'Failed to submit feedback');
            }
          })
          .catch((error) => showError('Network error: ' + error.message));
      });
    }
  }
}

function validateFeedbackForm(form) {
  const rating = form.querySelector('#rating').value;
  if (rating < 1 || rating > 5) {
    alert('Rating must be between 1 and 5.');
    return false;
  }
  return true;
}

function renderFeedbackTable(selectedEmployeeId) {
  const selectedId = selectedEmployeeId ? String(selectedEmployeeId) : '';
  let filteredFeedback = feedback;
  if (selectedId) {
    filteredFeedback = feedback.filter(
      (f) => String(f.employee_id) === selectedId
    );
  }

  let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-sizing: border-box;">
          <thead>
              <tr style="background-color: #003087; color: #FFFFFF;">
                  <th style="padding: 10px; text-align: center; box-sizing: border-box;">Employee</th>
                  <th style="padding: 10px; text-align: center; box-sizing: border-box;">Rating</th>
                  <th style="padding: 10px; text-align: center; box-sizing: border-box;">Type</th>
                  <th style="padding: 10px; text-align: center; box-sizing: border-box;">Feedback</th>
                  <th style="padding: 10px; text-align: center; box-sizing: border-box;">Date Submitted</th>
              </tr>
          </thead>
          <tbody>
  `;

  if (filteredFeedback.length === 0) {
    tableHTML += `
          <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; text-align: center; box-sizing: border-box;" colspan="5">No feedback available.</td>
          </tr>
      `;
  } else {
    filteredFeedback.forEach((f) => {
      tableHTML += `
              <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    f.first_name
                  } ${f.last_name}</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    f.rating || 'N/A'
                  }</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    f.feedback_type || 'N/A'
                  }</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    f.feedback_text || 'N/A'
                  }</td>
                  <td style="padding: 10px; text-align: center; box-sizing: border-box;">${
                    f.date_submitted || 'N/A'
                  }</td>
              </tr>
          `;
    });
  }

  tableHTML += `</tbody></table>`;
  return tableHTML;
}

function showFeedbackHistory() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'block';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';

    let feedbackTableHTML = `
          <h2>Feedback History</h2>
          <div class="form-group">
              <label for="employee-filter">Filter by Employee:</label>
              <select id="employee-filter" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                  <option value="">All Employees</option>
                  ${employees
                    .map(
                      (emp) =>
                        `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`
                    )
                    .join('')}
              </select>
          </div>
          <div id="feedback-table-container">
              ${renderFeedbackTable('')}
          </div>
          <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
              <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                      onmouseover="this.style.backgroundColor='#5a6268'" 
                      onmouseout="this.style.backgroundColor='#6c757d'"
                      onclick="showWelcomeMessage(event)">Back</button>
          </div>
      `;

    profileUpdateForm.innerHTML = feedbackTableHTML;

    const employeeFilter = document.getElementById('employee-filter');
    const tableContainer = document.getElementById('feedback-table-container');
    if (employeeFilter && tableContainer) {
      employeeFilter.addEventListener('change', function () {
        tableContainer.innerHTML = renderFeedbackTable(this.value);
      });
    }
  }
}

function showReportsAnalytics() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const reportContent = document.getElementById('report-content');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    reportContent &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'block';
    reportContent.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';

    const generateReportBtn = document.getElementById('generate-report-btn');
    const employeeSearch = document.getElementById('employee-search');
    if (generateReportBtn && employeeSearch) {
      generateReportBtn.addEventListener('click', function () {
        const selectedEmployeeId = employeeSearch.value;
        if (!selectedEmployeeId) {
          alert('Please select an employee to generate the report.');
          return;
        }

        const filteredAvgRatings = reportAvgRatings.filter(
          (report) => String(report.employee_id) === selectedEmployeeId
        );
        const filteredFeedback = feedback.filter(
          (fb) => String(fb.employee_id) === selectedEmployeeId
        );
        const filteredFeedbackTypes = reportFeedbackTypes
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

        const avgRatingsTable = document.getElementById('avg-ratings-table');
        avgRatingsTable.innerHTML = '';
        if (filteredAvgRatings.length === 0) {
          avgRatingsTable.innerHTML = `<tr><td colspan="3" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td></tr>`;
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

        const feedbackTypesTable = document.getElementById(
          'feedback-types-table'
        );
        feedbackTypesTable.innerHTML = '';
        if (filteredFeedbackTypes.length === 0) {
          feedbackTypesTable.innerHTML = `<tr><td colspan="2" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td></tr>`;
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

        const feedbackSummaryTable = document.getElementById(
          'feedback-summary-table'
        );
        feedbackSummaryTable.innerHTML = '';
        if (filteredFeedback.length === 0) {
          feedbackSummaryTable.innerHTML = `<tr><td colspan="5" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td></tr>`;
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
      });
    }

    const initializeDownloadPdf = () => {
      const downloadPdfBtn = document.getElementById('download-pdf-btn');
      if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function () {
          const reportContent = document.getElementById('report-content');
          if (!reportContent) {
            showError(
              'Report content not found. Please generate the report first.'
            );
            return;
          }

          if (
            typeof html2canvas === 'undefined' ||
            typeof window.jspdf === 'undefined'
          ) {
            showError('PDF libraries not loaded.');
            return;
          }

          downloadPdfBtn.style.display = 'none';
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

              const selectedEmployee =
                employeeSearch.options[employeeSearch.selectedIndex].text;
              pdf.save(
                `Employee_Report_${selectedEmployee}_${
                  new Date().toISOString().split('T')[0]
                }.pdf`
              );
              downloadPdfBtn.style.display = 'block';
            })
            .catch((error) => {
              showError('Failed to generate PDF: ' + error.message);
              downloadPdfBtn.style.display = 'block';
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
        loadScript('../assets/js/html2canvas.min.js', (error) =>
          error ? reject(error) : resolve()
        );
      });
      const loadJsPDF = new Promise((resolve, reject) => {
        if (typeof window.jspdf !== 'undefined') return resolve();
        loadScript('../assets/js/jspdf.umd.min.js', (error) =>
          error ? reject(error) : resolve()
        );
      });
      Promise.all([loadHtml2Canvas, loadJsPDF])
        .then(initializeDownloadPdf)
        .catch((error) =>
          showError('Failed to load PDF libraries: ' + error.message)
        );
    }
  }
}

function loadScript(url, callback) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => callback();
  script.onerror = () => callback(new Error(`Failed to load script: ${url}`));
  document.head.appendChild(script);
}

function showError(message, containerId = 'profile-update-form') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML =
      `<div class="alert alert-error">${message}</div>` + container.innerHTML;
  }
}

// Projects and Tasks Functions
function showProjects() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'block';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';

    const projectsTable = document.getElementById('projects-table');
    projectsTable.innerHTML = '';
    if (projects.length === 0) {
      projectsTable.innerHTML = `<tr><td colspan="8" style="padding: 10px; text-align: center;">No active projects found.</td></tr>`;
    } else {
      projects.forEach((p) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                  <td>${p.project_name}</td>
                  <td>${p.project_status}</td>
                  <td>$${parseFloat(p.budget).toFixed(2)}</td>
                  <td>${
                    p.actual_cost
                      ? '$' + parseFloat(p.actual_cost).toFixed(2)
                      : 'N/A'
                  }</td>
                  <td>${p.start_date}</td>
                  <td>${p.expected_end_date}</td>
                  <td>${p.actual_end_date || 'N/A'}</td>
                  <td>${p.client_name} (${p.client_contact_email})</td>
              `;
        projectsTable.appendChild(row);
      });
    }
  }
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
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'block';
    subtasksSection.style.display = 'none';

    const form = document.getElementById('assign-employees-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      fetch('../pages/features/manage_assignments.php', {
        method: 'POST',
        body: new FormData(this),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            refreshData(showProjects);
          } else {
            showError(
              data.error || 'Failed to assign employee',
              'assign-employees-section'
            );
          }
        })
        .catch((error) =>
          showError(
            'Network error: ' + error.message,
            'assign-employees-section'
          )
        );
    });
  }
}

function showSubtasksForm() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById(
    'assign-employees-section'
  );
  const subtasksSection = document.getElementById('subtasks-section');
  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'block';

    loadTasks(); // Load tasks for the selected project initially
    const form = document.getElementById('subtask-form');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      fetch('../pages/features/manage_tasks.php', {
        method: 'POST',
        body: new FormData(this),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            refreshData(showSubtasksForm);
            resetSubtaskForm();
          } else {
            showError(data.error || 'Failed to save task', 'subtasks-section');
          }
        })
        .catch((error) =>
          showError('Network error: ' + error.message, 'subtasks-section')
        );
    });
  }
}

function loadTasks() {
  const projectId = document.getElementById('project_id_subtask').value;
  const taskSelect = document.getElementById('task_id');
  const tasksTable = document.getElementById('tasks-table');
  taskSelect.innerHTML = '<option value="">Create new task</option>';
  tasksTable.innerHTML = '';

  if (projectId) {
    const projectTasks = tasks.filter((t) => t.project_id == projectId);
    projectTasks.forEach((t) => {
      taskSelect.innerHTML += `<option value="${t.task_id}">${t.task_description}</option>`;
      const row = document.createElement('tr');
      row.innerHTML = `
              <td>${t.task_description}</td>
              <td>${t.project_name}</td>
              <td>${
                t.first_name ? t.first_name + ' ' + t.last_name : 'Unassigned'
              }</td>
              <td>${t.due_date || 'N/A'}</td>
              <td>${t.status}</td>
          `;
      row.onclick = () => populateTaskForm(t);
      tasksTable.appendChild(row);
    });
  }
}

function populateTaskForm(task) {
  document.getElementById('task_id').value = task.task_id;
  document.getElementById('task_description').value = task.task_description;
  document.getElementById('project_id_subtask').value = task.project_id;
  document.getElementById('employee_id_subtask').value = task.employee_id || '';
  document.getElementById('due_date').value = task.due_date || '';
  document.getElementById('task_status').value = task.status;
  document.getElementById('delete-task-btn').style.display = 'block';
}

function resetSubtaskForm() {
  document.getElementById('subtask-form').reset();
  document.getElementById('task_id').value = '';
  document.getElementById('delete-task-btn').style.display = 'none';
  loadTasks();
}

function deleteTask() {
  const taskId = document.getElementById('task_id').value;
  if (!taskId) {
    showError('No task selected to delete', 'subtasks-section');
    return;
  }

  if (confirm('Are you sure you want to delete this task?')) {
    fetch('../pages/features/manage_tasks.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `action=delete&task_id=${taskId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          refreshData(showSubtasksForm);
          resetSubtaskForm();
        } else {
          showError(data.error || 'Failed to delete task', 'subtasks-section');
        }
      })
      .catch((error) =>
        showError('Network error: ' + error.message, 'subtasks-section')
      );
  }
}
