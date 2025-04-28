// superadmin_dashboard.js

// Reset all sections
function resetAllSections() {
  const sections = [
    'main-content',
    'create-user-form',
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

// Show Reports and Analytics section
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
  const isVisible = dropdown.style.display === 'block';
  document
    .querySelectorAll('.dropdown')
    .forEach((d) => (d.style.display = 'none'));
  dropdown.style.display = isVisible ? 'none' : 'block';
}
