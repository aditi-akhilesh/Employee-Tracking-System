function showWelcomeMessage(event) {
  event.preventDefault();
  const mainContent = document.getElementById('content-area');
  const innerMainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');
  const editAssignmentSection = document.getElementById('edit-assignment-section');

  if (
    mainContent &&
    innerMainContent &&
    profileUpdateForm &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection &&
    editAssignmentSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'block';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';
    editAssignmentSection.style.display = 'none';
  }
}

function showReportsAnalytics() {
  const mainContent = document.getElementById('content-area');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const innerMainContent = document.getElementById('main-content');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const reportContent = document.getElementById('report-content');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');

  if (
    mainContent &&
    profileUpdateForm &&
    innerMainContent &&
    reportsAnalytics &&
    reportContent &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'block';
    reportContent.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

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
        const filteredWorkSummary = workSummary.filter(
          (ws) => String(ws.employee_id) === selectedEmployeeId
        );
        const filteredTrainings = employeeTrainings.filter(
          (et) => String(et.employee_id) === selectedEmployeeId
        );

        // Average Ratings Table
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

        // Feedback Types Table
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

        // Feedback Summary Table
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

        // Work Summary Table
        const workSummaryTable = document.getElementById('work-summary-table');
        workSummaryTable.innerHTML = '';
        if (filteredWorkSummary.length === 0) {
          workSummaryTable.innerHTML = `<tr><td colspan="5">No work summary available for this employee.</td></tr>`;
        } else {
          filteredWorkSummary.forEach((ws) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${ws.first_name} ${ws.last_name}</td>
              <td>${ws.assigned_projects || 'None'}</td>
              <td>${ws.project_count}</td>
              <td>${ws.task_count}</td>
              <td>${ws.completed_tasks}</td>
            `;
            workSummaryTable.appendChild(row);
          });
        }

        // Training and Certifications Table
        const trainingTable = document.getElementById('training-table');
        trainingTable.innerHTML = '';
        if (filteredTrainings.length === 0) {
          trainingTable.innerHTML = `<tr><td colspan="5">No training data available for this employee.</td></tr>`;
        } else {
          filteredTrainings.forEach((et) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${et.training_name}</td>
              <td>${et.training_date}</td>
              <td>${et.certificate || 'N/A'}</td>
              <td>${et.completion_status}</td>
              <td>${et.score || 'N/A'}</td>
            `;
            trainingTable.appendChild(row);
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
            showError('Report content not found. Please generate the report first.');
            return;
          }

          if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
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
                pdf.addImage(imgData, 'PNG', 10, position - remainingHeight, imgWidth, imgHeight);
              }

              const selectedEmployee = employeeSearch.options[employeeSearch.selectedIndex].text;
              pdf.save(`Employee_Report_${selectedEmployee}_${new Date().toISOString().split('T')[0]}.pdf`);
              downloadPdfBtn.style.display = 'block';
            })
            .catch((error) => {
              showError('Failed to generate PDF: ' + error.message);
              downloadPdfBtn.style.display = 'block';
            });
        });
      }
    };

    if (typeof html2canvas !== 'undefined' && typeof window.jspdf !== 'undefined') {
      initializeDownloadPdf();
    } else {
      const loadHtml2Canvas = new Promise((resolve, reject) => {
        if (typeof html2canvas !== 'undefined') return resolve();
        loadScript('../assets/js/html2canvas.min.js', (error) => error ? reject(error) : resolve());
      });
      const loadJsPDF = new Promise((resolve, reject) => {
        if (typeof window.jspdf !== 'undefined') return resolve();
        loadScript('../assets/js/jspdf.umd.min.js', (error) => error ? reject(error) : resolve());
      });
      Promise.all([loadHtml2Canvas, loadJsPDF])
        .then(initializeDownloadPdf)
        .catch((error) => showError('Failed to load PDF libraries: ' + error.message));
    }
  }
}

function showProjects() {
  const mainContent = document.getElementById('content-area');
  const innerMainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');

  if (
    mainContent &&
    innerMainContent &&
    profileUpdateForm &&
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
    projectsSection.style.display = 'block';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'none';

    const projectsTable = document.getElementById('projects-table');
    projectsTable.innerHTML = '';

    if (projects.length === 0) {
      projectsTable.innerHTML = `<tr><td colspan="8">No active projects found.</td></tr>`;
    } else {
      projects.forEach((project) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${project.project_name}</td>
          <td>${project.project_status}</td>
          <td>$${parseFloat(project.budget).toFixed(2)}</td>
          <td>${project.actual_cost ? '$' + parseFloat(project.actual_cost).toFixed(2) : 'N/A'}</td>
          <td>${project.start_date}</td>
          <td>${project.expected_end_date}</td>
          <td>${project.actual_end_date || 'N/A'}</td>
          <td>${project.client_name} (${project.client_contact_email})</td>
        `;
        projectsTable.appendChild(row);
      });
    }
  }
}

function showAssignEmployees() {
  const mainContent = document.getElementById('content-area');
  const innerMainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');

  if (
    mainContent &&
    innerMainContent &&
    profileUpdateForm &&
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

    const assignForm = document.getElementById('assign-employees-form');
    if (assignForm) {
      assignForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(assignForm);
        const projectId = formData.get('project_id');
        const employeeId = formData.get('employee_id');
        const roleInProject = formData.get('role_in_project');

        fetch('../actions/assign_employee.php', {
          method: 'POST',
          body: new URLSearchParams({
            project_id: projectId,
            employee_id: employeeId,
            role_in_project: roleInProject,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showSuccess(data.message || 'Employee assigned successfully!');
              assignForm.reset();
              refreshData('project_assignments');
            } else {
              showError(data.error || 'Failed to assign employee.');
            }
          })
          .catch((error) => {
            showError('Error: ' + error.message);
          });
      });
    }
  }
}

function showProjectAssignments() {
  const mainContent = document.getElementById('content-area');
  const innerMainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');
  const editAssignmentSection = document.getElementById('edit-assignment-section');

  if (
    mainContent &&
    innerMainContent &&
    profileUpdateForm &&
    reportsAnalytics &&
    projectsSection &&
    assignEmployeesSection &&
    subtasksSection &&
    projectAssignmentsSection &&
    editAssignmentSection
  ) {
    mainContent.style.display = 'block';
    innerMainContent.style.display = 'none';
    profileUpdateForm.style.display = 'none';
    reportsAnalytics.style.display = 'none';
    projectsSection.style.display = 'none';
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'none';
    projectAssignmentsSection.style.display = 'block';
    editAssignmentSection.style.display = 'none';

    loadAssignments();
  }
}

function loadAssignments() {
  const projectId = document.getElementById('project_id_view').value;
  const assignmentsTable = document.getElementById('assignments-table');
  assignmentsTable.innerHTML = '';

  if (!projectId) {
    assignmentsTable.innerHTML = `<tr><td colspan="4">Please select a project to view assignments.</td></tr>`;
    return;
  }

  const filteredAssignments = projectAssignments.filter(
    (assignment) => String(assignment.project_id) === projectId
  );

  if (filteredAssignments.length === 0) {
    assignmentsTable.innerHTML = `<tr><td colspan="4">No assignments found for this project.</td></tr>`;
  } else {
    filteredAssignments.forEach((assignment) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${assignment.project_name}</td>
        <td>${assignment.first_name} ${assignment.last_name}</td>
        <td>${assignment.role_in_project}</td>
        <td>
          <button onclick="editAssignment(${assignment.assignment_id}, '${assignment.first_name} ${assignment.last_name}', '${assignment.project_name}', '${assignment.role_in_project}')">Edit</button>
          <button onclick="removeAssignment(${assignment.assignment_id})">Remove</button>
        </td>
      `;
      assignmentsTable.appendChild(row);
    });
  }
}

function editAssignment(assignmentId, employeeName, projectName, roleInProject) {
  const projectAssignmentsSection = document.getElementById('project-assignments-section');
  const editAssignmentSection = document.getElementById('edit-assignment-section');

  if (projectAssignmentsSection && editAssignmentSection) {
    projectAssignmentsSection.style.display = 'none';
    editAssignmentSection.style.display = 'block';

    document.getElementById('edit_assignment_id').value = assignmentId;
    document.getElementById('edit_employee_name').value = employeeName;
    document.getElementById('edit_project_name').value = projectName;
    document.getElementById('edit_role_in_project').value = roleInProject;

    const editForm = document.getElementById('edit-assignment-form');
    if (editForm) {
      editForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(editForm);
        const updatedRole = formData.get('role_in_project');
        const assignmentId = formData.get('assignment_id');

        fetch('', {
          method: 'POST',
          body: new URLSearchParams({
            action: 'update_assignment',
            assignment_id: assignmentId,
            role_in_project: updatedRole,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showSuccess('Assignment updated successfully!');
              projectAssignments = data.project_assignments;
              projects = data.projects;
              showProjectAssignments();
            } else {
              showError(data.error || 'Failed to update assignment.');
            }
          })
          .catch((error) => {
            showError('Error: ' + error.message);
          });
      });
    }
  }
}

function removeAssignment(assignmentId) {
  if (confirm('Are you sure you want to remove this assignment?')) {
    fetch('', {
      method: 'POST',
      body: new URLSearchSearchParams({
        action: 'remove_assignment',
        assignment_id: assignmentId,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess('Assignment removed successfully!');
          projectAssignments = data.project_assignments;
          projects = data.projects;
          loadAssignments();
        } else {
          showError(data.error || 'Failed to remove assignment.');
        }
      })
      .catch((error) => {
        showError('Error: ' + error.message);
      });
  }
}

function showSubtasks() {
  const mainContent = document.getElementById('content-area');
  const innerMainContent = document.getElementById('main-content');
  const profileUpdateForm = document.getElementById('profile-update-form');
  const reportsAnalytics = document.getElementById('reports-analytics');
  const projectsSection = document.getElementById('projects-section');
  const assignEmployeesSection = document.getElementById('assign-employees-section');
  const subtasksSection = document.getElementById('subtasks-section');
  const projectAssignmentsSection = document.getElementById('project-assignments-section');

  if (
    mainContent &&
    innerMainContent &&
    profileUpdateForm &&
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
    assignEmployeesSection.style.display = 'none';
    subtasksSection.style.display = 'block';
    projectAssignmentsSection.style.display = 'none';

    loadTasks();

    const subtaskForm = document.getElementById('subtask-form');
    if (subtaskForm) {
      subtaskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(subtaskForm);
        const taskId = formData.get('task_id');
        const projectId = formData.get('project_id');
        const taskDescription = formData.get('task_description');
        const employeeId = formData.get('employee_id');
        const dueDate = formData.get('due_date');
        const status = formData.get('status');

        const url = taskId
          ? '../actions/update_task.php'
          : '../actions/create_task.php';

        fetch(url, {
          method: 'POST',
          body: new URLSearchParams({
            task_id: taskId,
            project_id: projectId,
            task_description: taskDescription,
            employee_id: employeeId,
            due_date: dueDate,
            status: status,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showSuccess(data.message || 'Task saved successfully!');
              subtaskForm.reset();
              document.getElementById('delete-task-btn').style.display = 'none';
              refreshData('tasks');
            } else {
              showError(data.error || 'Failed to save task.');
            }
          })
          .catch((error) => {
            showError('Error: ' + error.message);
          });
      });
    }
  }
}

function loadTasks() {
  const projectId = document.getElementById('project_id_subtask').value;
  const taskSelect = document.getElementById('task_id');
  const tasksTable = document.getElementById('tasks-table');
  tasksTable.innerHTML = '';

  const filteredTasks = projectId
    ? tasks.filter((task) => String(task.project_id) === projectId)
    : tasks;

  taskSelect.innerHTML = '<option value="">Create new task</option>';
  filteredTasks.forEach((task) => {
    const option = document.createElement('option');
    option.value = task.task_id;
    option.textContent = task.task_description;
    taskSelect.appendChild(option);
  });

  if (filteredTasks.length === 0) {
    tasksTable.innerHTML = `<tr><td colspan="5">No tasks found for this project.</td></tr>`;
  } else {
    filteredTasks.forEach((task) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${task.task_description}</td>
        <td>${task.project_name}</td>
        <td>${task.first_name ? task.first_name + ' ' + task.last_name : 'Unassigned'}</td>
        <td>${task.due_date || 'N/A'}</td>
        <td>${task.status}</td>
      `;
      tasksTable.appendChild(row);
    });
  }

  taskSelect.onchange = function () {
    const selectedTaskId = taskSelect.value;
    const deleteBtn = document.getElementById('delete-task-btn');
    if (selectedTaskId) {
      const task = filteredTasks.find((t) => String(t.task_id) === selectedTaskId);
      if (task) {
        document.getElementById('task_description').value = task.task_description;
        document.getElementById('employee_id_subtask').value = task.employee_id || '';
        document.getElementById('due_date').value = task.due_date || '';
        document.getElementById('task_status').value = task.status;
        deleteBtn.style.display = 'inline-block';
      }
    } else {
      subtaskForm.reset();
      deleteBtn.style.display = 'none';
    }
  };
}

function deleteTask() {
  const taskId = document.getElementById('task_id').value;
  if (!taskId) {
    showError('No task selected to delete.');
    return;
  }

  if (confirm('Are you sure you want to delete this task?')) {
    fetch('../actions/delete_task.php', {
      method: 'POST',
      body: new URLSearchParams({
        task_id: taskId,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess(data.message || 'Task deleted successfully!');
          document.getElementById('subtask-form').reset();
          document.getElementById('delete-task-btn').style.display = 'none';
          refreshData('tasks');
        } else {
          showError(data.error || 'Failed to delete task.');
        }
      })
      .catch((error) => {
        showError('Error: ' + error.message);
      });
  }
}

function refreshData(section = 'all') {
  fetch('', {
    method: 'POST',
    body: new URLSearchParams({
      action: 'refresh_data',
      section: section,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        if (section === 'all' || section === 'projects' || section === 'project_assignments') {
          projects = data.projects || [];
          projectAssignments = data.project_assignments || [];
          if (document.getElementById('projects-section').style.display === 'block') {
            showProjects();
          }
          if (document.getElementById('project-assignments-section').style.display === 'block') {
            loadAssignments();
          }
        }
        if (section === 'all' || section === 'tasks') {
          tasks = data.tasks || [];
          if (document.getElementById('subtasks-section').style.display === 'block') {
            loadTasks();
          }
        }
        if (section === 'all' || section === 'reports') {
          feedback = data.feedback || [];
          reportAvgRatings = data.report_avg_ratings || [];
          reportFeedbackTypes = data.report_feedback_types || [];
          employeeTrainings = data.employee_trainings || [];
          workSummary = data.work_summary || [];
        }
      } else {
        showError(data.error || 'Failed to refresh data.');
      }
    })
    .catch((error) => {
      showError('Error: ' + error.message);
    });
}

function showSuccess(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-error';
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => callback(null);
  script.onerror = () => callback(new Error(`Failed to load script: ${src}`));
  document.head.appendChild(script);
}