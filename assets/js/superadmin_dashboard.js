// superadmin_dashboard.js

// Centralized function to manage section visibility
function showSection(sectionToShowId) {
  const sections = [
    'main-content',
    'reports-analytics',
    'create-user-form',
    'attendance-records',
    'leave-requests',
    'department-metrics',
    'profile-update-form',
    'Department_content',
    'update-remove-user-section',
    'department-management-section',
    'audit-logs-section',
    'training-programs',
    'training-assignments',
    'project-overview-section',
    'performance-metrics-section',
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

// Utility function to escape HTML characters to prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str || '';
  return str.replace(
    /[&<>"']/g,
    (match) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[match])
  );
}
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

// Fallback for showError if not defined
if (typeof showError === 'undefined') {
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    errorDiv.onclick = () => (errorDiv.style.display = 'none');
    document.getElementById('content-area').prepend(errorDiv);
  }
}

// Function to implement table sorting
function addTableSorting(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with ID ${tableId} not found`);
    return;
  }

  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    // Skip the last column ("Certificate Name") for training-assignments-table
    if (
      tableId === 'training-assignments-table' &&
      index === headers.length - 1
    ) {
      return;
    }

    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const isAscending = header.getAttribute('data-sort') !== 'asc';
      const sortDirection = isAscending ? 'asc' : 'desc';

      // Update sort direction attribute
      headers.forEach((h) => h.removeAttribute('data-sort'));
      header.setAttribute('data-sort', sortDirection);

      // Update sort icons
      headers.forEach((h) => {
        const icon = h.querySelector('i.fas');
        if (icon) {
          icon.className = 'fas fa-sort';
        }
      });
      const icon = header.querySelector('i.fas');
      if (icon) {
        icon.className = isAscending ? 'fas fa-sort-up' : 'fas fa-sort-down';
      }

      // Sort rows
      rows.sort((a, b) => {
        let aValue, bValue;

        // Special handling for the "Status" column (index 3 in training-assignments-table)
        if (tableId === 'training-assignments-table' && index === 3) {
          aValue =
            a.cells[index].querySelector('.status-badge')?.textContent || '';
          bValue =
            b.cells[index].querySelector('.status-badge')?.textContent || '';
        } else {
          aValue = a.cells[index].textContent.trim();
          bValue = b.cells[index].textContent.trim();
        }

        // Handle special cases for "N/A" values
        if (aValue === 'N/A')
          aValue =
            tableId === 'training-assignments-table' && index === 4
              ? -Infinity
              : '';
        if (bValue === 'N/A')
          bValue =
            tableId === 'training-assignments-table' && index === 4
              ? -Infinity
              : '';

        // Handle numeric values (e.g., Score, Duration)
        const isNumeric =
          !isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue));
        if (isNumeric) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        // Handle date values (e.g., Enrollment Date)
        if (tableId === 'training-assignments-table' && index === 2) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        if (tableId === 'training-table' && (index === 2 || index === 3)) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Compare values
        if (aValue < bValue) return isAscending ? -1 : 1;
        if (aValue > bValue) return isAscending ? 1 : -1;
        return 0;
      });

      // Re-append sorted rows
      tbody.innerHTML = '';
      rows.forEach((row) => tbody.appendChild(row));
    });
  });
}

// Function to render Training Certificates table
function renderTrainingCertificatesTable() {
  const tbody = document.getElementById('training-certificates-table');
  if (!tbody || !window.trainingCertificates) return;
  tbody.innerHTML = '';
  window.trainingCertificates.forEach((cert) => {
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${escapeHTML(cert.training_name)}</td>
          <td>${escapeHTML(cert.training_date)}</td>
          <td>${escapeHTML(cert.certificate)}</td>
          <td>${cert.score ? escapeHTML(cert.score) : 'N/A'}</td>
      `;
    tbody.appendChild(row);
  });
}

// Function to show Training Programs
function showTrainingPrograms() {
  const section = document.getElementById('training-programs');
  const contentArea = document.getElementById('content-area');
  if (!section || !contentArea) {
    console.error('Training programs section or content area not found');
    return;
  }

  contentArea
    .querySelectorAll('.card, #main-content')
    .forEach((el) => (el.style.display = 'none'));
  section.style.display = 'block';

  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=fetch_trainings',
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showError(data.error || 'Failed to fetch training programs');
        return;
      }
      const tbody = document.getElementById('training-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';
      data.trainings.forEach((training) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${escapeHTML(training.training_name)}</td>
                    <td>${escapeHTML(training.department_name || 'N/A')}</td>
                    <td>${escapeHTML(training.training_date)}</td>
                    <td>${escapeHTML(training.end_date)}</td>
                    <td>${
                      training.duration_days !== null
                        ? training.duration_days
                        : 'N/A'
                    }</td>
                    <td>${escapeHTML(training.certificate)}</td>
                `;
        tbody.appendChild(row);
      });
      addTableSorting('training-table');
    })
    .catch((err) =>
      showError('Error fetching training programs: ' + err.message)
    );
}

function downloadTrainingProgramsAsExcel() {
  // Fetch detailed data from the view via superadmin_dashboard.php
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data&section=training_programs_view', // Fixed typo: � to &
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Fetched data:', data); // Debugging: Log the response
      if (
        !data.success ||
        !data.training_programs_view ||
        data.training_programs_view.length === 0
      ) {
        alert('No data available to download.');
        return;
      }

      // Prepare data for Excel
      const worksheetData = data.training_programs_view.map((row) => ({
        'Training ID': row.training_id,
        'Training Name': row.training_name,
        Department: row.department_name || 'N/A',
        'Start Date': row.training_date,
        'End Date': row.end_date,
        'Duration (Days)':
          row.duration_days !== null ? row.duration_days : 'N/A',
        Certificate: row.certificate,
        'Employee ID': row.employee_id || 'N/A',
        'Employee Name': row.employee_name || 'N/A',
        'Training Status': row.training_status || 'N/A',
        Score: row.score !== null ? row.score : 'N/A',
        'Enrollment Date': row.enrollment_date || 'N/A',
      }));

      // Create a worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Set column widths (in characters)
      worksheet['!cols'] = [
        { wch: 15 }, // Training ID
        { wch: 30 }, // Training Name
        { wch: 25 }, // Department
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 15 }, // Duration (Days)
        { wch: 25 }, // Certificate
        { wch: 15 }, // Employee ID
        { wch: 25 }, // Employee Name
        { wch: 20 }, // Training Status
        { wch: 10 }, // Score
        { wch: 15 }, // Enrollment Date
      ];

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Training_Programs');

      // Generate the Excel file and trigger download
      XLSX.writeFile(workbook, 'Training_Programs_Detailed.xlsx');
    })
    .catch((error) => {
      console.error('Error fetching data for download:', error);
      alert('Failed to fetch data for download: ' + error.message);
    });
}

// Function to show Training Assignments
function showTrainingAssignments() {
  const section = document.getElementById('training-assignments');
  const contentArea = document.getElementById('content-area');
  if (!section || !contentArea) {
    console.error('Training assignments section or content area not found');
    return;
  }

  contentArea
    .querySelectorAll('.card, #main-content')
    .forEach((el) => (el.style.display = 'none'));
  section.style.display = 'block';

  const fetchBtn = document.getElementById('fetch-training-assignments-btn');
  if (fetchBtn) {
    // Clone button to prevent duplicate listeners
    const newFetchBtn = fetchBtn.cloneNode(true);
    fetchBtn.parentNode.replaceChild(newFetchBtn, fetchBtn);
    newFetchBtn.addEventListener('click', () => {
      const trainingId = document.getElementById(
        'training-assignments-filter'
      ).value;
      fetch('superadmin_dashboard.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=fetch_employee_trainings&training_id=${encodeURIComponent(
          trainingId
        )}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            showError(data.error || 'Failed to fetch training assignments');
            return;
          }
          const tbody = document.getElementById(
            'training-assignments-table-body'
          );
          if (!tbody) return;
          tbody.innerHTML = '';
          data.employee_trainings.forEach((assignment) => {
            const certificateName =
              assignment.certificate === 'Yes' &&
              assignment.completion_status === 'completed'
                ? escapeHTML(assignment.training_name)
                : 'N/A';
            const row = document.createElement('tr');
            row.innerHTML = `
                      <td>${escapeHTML(assignment.training_name)}</td>
                      <td>${escapeHTML(assignment.employee_name)}</td>
                      <td>${escapeHTML(assignment.enrollment_date)}</td>
                      <td><span class="status-badge status-${assignment.completion_status.toLowerCase()}">${escapeHTML(
              assignment.completion_status
            )}</span></td>
                      <td>${
                        assignment.score ? escapeHTML(assignment.score) : 'N/A'
                      }</td>
                      <td>${certificateName}</td>
                  `;
            tbody.appendChild(row);
          });
          addTableSorting('training-assignments-table');
        })
        .catch((err) =>
          showError('Error fetching training assignments: ' + err.message)
        );
    });
  }
}

// Existing generate-report-btn handler (unchanged, included for context)
const generateReportBtn = document.getElementById('generate-report-btn');
if (generateReportBtn) {
  const newButton = generateReportBtn.cloneNode(true);
  generateReportBtn.parentNode.replaceChild(newButton, generateReportBtn);
  const updatedGenerateReportBtn = document.getElementById(
    'generate-report-btn'
  );
  updatedGenerateReportBtn.addEventListener('click', () => {
    const employeeId = document.getElementById('employee-search').value;
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;

    reportContent.style.display = 'block';

    fetch('superadmin_dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=refresh_data&section=reports',
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          showError(data.error || 'Failed to generate report');
          return;
        }

        renderTrainingCertificatesTable();

        // Placeholder for other report tables
        const avgRatingsTbody = document.getElementById('avg-ratings-table');
        if (avgRatingsTbody && data.report_avg_ratings) {
          avgRatingsTbody.innerHTML = '';
          data.report_avg_ratings
            .filter(
              (rating) => !employeeId || rating.employee_id === employeeId
            )
            .forEach((rating) => {
              const row = document.createElement('tr');
              row.innerHTML = `
                          <td>${escapeHTML(
                            rating.first_name + ' ' + rating.last_name
                          )}</td>
                          <td>${
                            rating.avg_rating
                              ? parseFloat(rating.avg_rating).toFixed(2)
                              : 'N/A'
                          }</td>
                          <td>${rating.feedback_count || 0}</td>
                      `;
              avgRatingsTbody.appendChild(row);
            });
        }

        const feedbackTypesTbody = document.getElementById(
          'feedback-types-table'
        );
        if (feedbackTypesTbody && data.report_feedback_types) {
          feedbackTypesTbody.innerHTML = '';
          data.report_feedback_types.forEach((type) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                      <td>${escapeHTML(type.feedback_type)}</td>
                      <td>${type.type_count || 0}</td>
                  `;
            feedbackTypesTbody.appendChild(row);
          });
        }

        // Add more table population logic here
      })
      .catch((err) => showError('Error generating report: ' + err.message));
  });
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

// Store attendance records globally to access them for download
let currentAttendanceRecords = [];

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
          // Store the fetched data globally
          currentAttendanceRecords = data.attendance_records || [];

          attendanceTableBody.innerHTML = '';
          if (currentAttendanceRecords.length === 0) {
            attendanceTableBody.innerHTML = `<tr><td colspan="5">No attendance records found.</td></tr>`;
          } else {
            currentAttendanceRecords.forEach((record) => {
              const row = document.createElement('tr');
              row.innerHTML = `
                                <td>${escapeHTML(record.employee_name)}</td>
                                <td>${escapeHTML(record.department_name)}</td>
                                <td>${escapeHTML(record.check_in || 'N/A')}</td>
                                <td>${escapeHTML(
                                  record.check_out || 'N/A'
                                )}</td>
                                <td>${escapeHTML(record.status)}</td>
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

// Download Attendance Records as Excel
function downloadAttendanceAsExcel() {
  if (!currentAttendanceRecords || currentAttendanceRecords.length === 0) {
    alert(
      'No attendance records available to download. Please fetch records first.'
    );
    return;
  }

  // Prepare data for Excel
  const worksheetData = currentAttendanceRecords.map((record) => ({
    'Employee Name': record.employee_name,
    Department: record.department_name,
    'Check In': record.check_in || 'N/A',
    'Check Out': record.check_out || 'N/A',
    Status: record.status,
  }));

  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths (in characters)
  worksheet['!cols'] = [
    { wch: 20 }, // Employee Name
    { wch: 20 }, // Department
    { wch: 20 }, // Check In
    { wch: 20 }, // Check Out
    { wch: 15 }, // Status
  ];

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance_Records');

  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, 'Attendance_Records.xlsx');
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
          // Store the fetched data globally
          currentLeaveRequests = data.leave_applications || [];

          leaveTableBody.innerHTML = '';
          if (currentLeaveRequests.length === 0) {
            leaveTableBody.innerHTML = `<tr><td colspan="6">No leave requests found.</td></tr>`;
          } else {
            currentLeaveRequests.forEach((request) => {
              const row = document.createElement('tr');
              const statusClass =
                request.status === 'ispending'
                  ? 'status-pending'
                  : request.status === 'approved'
                  ? 'status-approved'
                  : 'status-rejected';
              row.innerHTML = `
                                <td>${escapeHTML(request.employee_name)}</td>
                                <td>${escapeHTML(request.leave_start_date)}</td>
                                <td>${escapeHTML(request.leave_end_date)}</td>
                                <td>${escapeHTML(request.leave_reason)}</td>
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

// Download Leave Requests as Excel
function downloadLeaveRequestsAsExcel() {
  if (!currentLeaveRequests || currentLeaveRequests.length === 0) {
    alert(
      'No leave requests available to download. Please fetch records first.'
    );
    return;
  }

  // Prepare data for Excel (excluding the Actions column)
  const worksheetData = currentLeaveRequests.map((request) => ({
    'Employee Name': request.employee_name,
    'Start Date': request.leave_start_date,
    'End Date': request.leave_end_date,
    Reason: request.leave_reason,
    Status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
  }));

  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths (in characters)
  worksheet['!cols'] = [
    { wch: 20 }, // Employee Name
    { wch: 15 }, // Start Date
    { wch: 15 }, // End Date
    { wch: 30 }, // Reason
    { wch: 15 }, // Status
  ];

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave_Requests');

  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, 'Leave_Requests.xlsx');
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
          <button type="button" onclick="showWelcomeMessage()">Back</button>
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

function showDepartment() {
  console.log('showDepartmentInfo called');
  if (!showSection('Department_content')) return;

  const departmentcontent = document.getElementById('Department_content');

  let html = `
        <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Department Information</h2>
        <table id="departmentTable" style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
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
            <button type="button" id="downloadExcelBtn" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                    onmouseover="this.style.backgroundColor='#218838'" 
                    onmouseout="this.style.backgroundColor='#28a745'"
                    onclick="downloadAsExcel()">Download as Excel</button>
        </div>
    `;
  departmentcontent.innerHTML = html;
}

function downloadAsExcel() {
  // Get the table element
  const table = document.getElementById('departmentTable');

  // Check if table exists and has data
  if (
    !table ||
    table.querySelector('tbody').children.length === 0 ||
    table.querySelector('td').textContent === 'No departments found.'
  ) {
    alert('No data available to download.');
    return;
  }

  // Convert the table to a worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.table_to_sheet(table);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');

  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, 'Department_Information.xlsx');
}
function showAllEmployees() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');

  // State for pagination and filters
  let currentPage = 1;
  let recordsPerPage = 5;
  let searchQuery = '';
  let filterDepartment = 'All';
  let filterRole = 'All';
  let employeesData = [];
  let filteredEmployees = [];

  // Fetch employee data
  fetch('../pages/features/fetch_employees_superadmin.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        employeesData = data.employees;
        if (employeesData.length === 0) {
          profileUpdateForm.innerHTML = `
            <div class="card">
                <h2>All Employees in the Company</h2>
                <p>No employees are currently assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage()">Back</button>
                </div>
            </div>
          `;
          return;
        }
        renderTable();
      } else {
        console.error('Error fetching employee data:', data.error);
        profileUpdateForm.innerHTML = `
          <div class="card">
              <h2>All Employees in the Company</h2>
              <p>Error fetching employee data: ${data.error}</p>
              <div class="form-group button-group">
                  <button type="button" onclick="showWelcomeMessage()">Back</button>
              </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      profileUpdateForm.innerHTML = `
        <div class="card">
            <h2>All Employees in the Company</h2>
            <p>Error fetching employee data: ${error.message}</p>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>
      `;
    });

  // Define exportToExcel globally
  window.exportToExcel = function () {
    const btn = document.querySelector('.download-btn');
    btn.disabled = true;
    btn.textContent = 'Downloading...';

    setTimeout(() => {
      if (!filteredEmployees || filteredEmployees.length === 0) {
        if (employeesData && employeesData.length > 0) {
          filteredEmployees = employeesData;
        } else {
          alert('No data available to export.');
          btn.disabled = false;
          btn.textContent = 'Download as Excel';
          return;
        }
      }

      const exportData = filteredEmployees.map((emp) => ({
        ID: emp.employee_id || 'N/A',
        Name: `${emp.first_name || 'N/A'} ${emp.last_name || 'N/A'}`,
        Email: emp.email || 'N/A',
        Role: emp.role || 'N/A',
        Department: emp.department_name || 'N/A',
        'Hire Date': emp.emp_hire_date || 'N/A',
        Salary: emp.salary ? '$' + parseFloat(emp.salary).toFixed(2) : 'N/A',
        'Total Trainings': emp.training_count || 0,
        'Completed Trainings': emp.completed_trainings || 0,
        'Total Tasks': emp.task_count || 0,
        'Total Leaves': emp.leave_count || 0,
        'Average Feedback Rating': emp.avg_feedback_rating
          ? parseFloat(emp.avg_feedback_rating).toFixed(2)
          : 'N/A',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');
      XLSX.writeFile(wb, 'Employees_Detailed_Data.xlsx');

      btn.disabled = false;
      btn.textContent = 'Download as Excel';
    }, 100);
  };

  function renderTable() {
    filteredEmployees = [...employeesData];

    if (searchQuery) {
      filteredEmployees = filteredEmployees.filter(
        (emp) =>
          `${emp.first_name || ''} ${emp.last_name || ''}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterDepartment !== 'All') {
      filteredEmployees = filteredEmployees.filter(
        (emp) => (emp.department_name || 'N/A') === filterDepartment
      );
    }

    if (filterRole !== 'All') {
      filteredEmployees = filteredEmployees.filter(
        (emp) => (emp.role || '').toLowerCase() === filterRole.toLowerCase()
      );
    }

    if (filteredEmployees.length === 0) {
      profileUpdateForm.innerHTML = `
        <div class="card">
            <h2>Employees Assigned to Me</h2>
            <p>No employees match the selected filters.</p>
            <div class="form-group button-group">
                <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        </div>
      `;
      return;
    }

    const totalRecords = filteredEmployees.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    currentPage = Math.max(currentPage, 1);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    const uniqueDepartments = [
      ...new Set(employeesData.map((emp) => emp.department_name || 'N/A')),
    ];
    const uniqueRoles = [
      ...new Set(employeesData.map((emp) => emp.role || 'N/A')),
    ];

    let employeesTableHTML = `
      <div class="card">
          <h2>All Employees in the Company</h2>
          <div id="form-group">
              <div>
                  <label>Show:</label>
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
                  <label>Department:</label>
                  <select id="filter-department" style="padding: 5px; margin-right: 10px;">
                      <option value="All">All</option>
                      ${uniqueDepartments
                        .map(
                          (dept) =>
                            `<option value="${dept}" ${
                              filterDepartment === dept ? 'selected' : ''
                            }>${dept}</option>`
                        )
                        .join('')}
                  </select>
                  <label>Role:</label>
                  <select id="filter-role" style="padding: 5px;">
                      <option value="All">All</option>
                      ${uniqueRoles
                        .map(
                          (role) =>
                            `<option value="${role}" ${
                              filterRole === role ? 'selected' : ''
                            }>${role}</option>`
                        )
                        .join('')}
                  </select>
              </div>
              </br><input type="text" id="search-input" placeholder="Search by name or email..." value="${searchQuery}">
          </div>
          <div class="button-group download-controls">
              <button type="button" id="downloadExcelBtn" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                    onmouseover="this.style.backgroundColor='#218838'" 
                    onmouseout="this.style.backgroundColor='#28a745'"
 onclick="exportToExcel()">Download employee information</button>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                  <tr>
                      <th style="padding: 10px; cursor: pointer;">ID</th>
                      <th style="padding: 10px; cursor: pointer;">Name</th>
                      <th style="padding: 10px; cursor: pointer;">Email</th>
                      <th style="padding: 10px; cursor: pointer;">Role</th>
                      <th style="padding: 10px; cursor: pointer;">Department</th>
                      <th style="padding: 10px; cursor: pointer;">Hire Date</th>
                      <th style="padding: 10px; cursor: pointer;">Salary</th>
                  </tr>
              </thead>
              <tbody id="employees-table-body">
    `;

    paginatedEmployees.forEach((emp, index) => {
      employeesTableHTML += `
        <tr style="border-bottom: 1px solid #ddd; background-color: ${
          index % 2 === 0 ? '#f9f9f9' : '#ffffff'
        };">
            <td style="padding: 10px;">${emp.employee_id || 'N/A'}</td>
            <td style="padding: 10px;">${emp.first_name || 'N/A'} ${
        emp.last_name || 'N/A'
      }</td>
            <td style="padding: 10px;">${emp.email || 'N/A'}</td>
            <td style="padding: 10px;">${emp.role || 'N/A'}</td>
            <td style="padding: 10px;">${emp.department_name || 'N/A'}</td>
            <td style="padding: 10px;">${emp.emp_hire_date || 'N/A'}</td>
            <td style="padding: 10px;">${
              emp.salary ? '$' + parseFloat(emp.salary).toFixed(2) : 'N/A'
            }</td>
        </tr>
      `;
    });

    employeesTableHTML += `
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
                  <button style="padding: 5px 10px; margin: 0 5px;" class="${
                    currentPage === 1 ? 'disabled' : ''
                  }" onclick="changePage(${currentPage - 1})">Previous</button>
    `;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      employeesTableHTML += `
        <button style="padding: 5px 10px; margin: 0 5px;" class="${
          i === currentPage ? 'active' : ''
        }" onclick="changePage(${i})">${i}</button>
      `;
    }

    employeesTableHTML += `
                  <button style="padding: 5px 10px; margin: 0 5px;" class="${
                    currentPage === totalPages ? 'disabled' : ''
                  }" onclick="changePage(${currentPage + 1})">Next</button>
              </div>
          </div>
          <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
              <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                    onmouseover="this.style.backgroundColor='#5a6268'" 
                    onmouseout="this.style.backgroundColor='#6c757d'"
                    onclick="showWelcomeMessage()">Back</button>
          </div>
      </div>
    `;

    profileUpdateForm.innerHTML = employeesTableHTML;

    const searchInput = document.getElementById('search-input');
    const filterDepartmentSelect = document.getElementById('filter-department');
    const filterRoleSelect = document.getElementById('filter-role');
    const recordsPerPageSelect = document.getElementById('records-per-page');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    if (filterDepartmentSelect) {
      filterDepartmentSelect.addEventListener('change', (e) => {
        filterDepartment = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    if (filterRoleSelect) {
      filterRoleSelect.addEventListener('change', (e) => {
        filterRole = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    if (recordsPerPageSelect) {
      recordsPerPageSelect.addEventListener('change', (e) => {
        recordsPerPage = parseInt(e.target.value, 10);
        currentPage = 1;
        renderTable();
      });
    }
  }

  window.changePage = function (page) {
    currentPage = page;
    renderTable();
  };
}
function exportToExcel() {
  if (!filteredEmployees.length) {
    alert('No data to export.');
    return;
  }
  const btn = document.querySelector('.download-btn');
  btn.disabled = true;
  btn.textContent = 'Downloading...';
  setTimeout(() => {
    const exportData = filteredEmployees.map((emp) => ({
      ID: emp.employee_id || 'N/A',
      Name: `${emp.first_name || 'N/A'} ${emp.last_name || 'N/A'}`,
      Email: emp.email || 'N/A',
      Role: emp.role || 'N/A',
      Department:
        departments.find((d) => d.department_id === emp.department_id)
          ?.department_name || 'N/A',
      'Hire Date': emp.emp_hire_date || 'N/A',
      Salary: emp.salary ? '$' + parseFloat(emp.salary).toFixed(2) : 'N/A',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'Employees_Data.xlsx');
    btn.disabled = false;
    btn.textContent = 'Download as Excel';
  }, 100);
}

function showUpdateRemoveUserForm(event) {
  if (event) event.preventDefault();
  console.log('showUpdateRemoveUserForm called');

  // Use showSection to ensure only update-remove-user-section is visible
  if (!showSection('update-remove-user-section')) return;

  const updateRemoveUserSection = document.getElementById(
    'update-remove-user-section'
  );
  if (!updateRemoveUserSection) {
    console.error('update-remove-user-section not found');
    showError('Update/Remove User section not found.', 'content-area');
    return;
  }

  // State for pagination and filters
  let currentPage = 1;
  let recordsPerPage = 5;
  let filterRole = 'All';

  // Get the current filter value (if any) before re-rendering
  const roleFilter = document.getElementById('role-filter');
  if (roleFilter) {
    filterRole = roleFilter.value;
  }

  console.log('Employees array:', employeesadmin);
  console.log(
    'Roles in employeesadmin:',
    employeesadmin.map((emp) => emp.role)
  );

  function renderEmployeesTable() {
    let filtered = employeesadmin.filter((emp) => {
      const role = emp.role ? emp.role.trim().toLowerCase() : '';
      return (
        (role === 'user' || role === 'manager' || role === 'hr') &&
        emp.emp_status?.toLowerCase() !== 'inactive'
      );
    });

    if (filterRole === 'User') {
      filtered = filtered.filter(
        (emp) => emp.role.trim().toLowerCase() === 'user'
      );
    } else if (filterRole === 'Manager') {
      filtered = filtered.filter(
        (emp) => emp.role.trim().toLowerCase() === 'manager'
      );
    } else if (filterRole === 'HR') {
      filtered = filtered.filter(
        (emp) => emp.role.trim().toLowerCase() === 'hr'
      );
    }

    console.log('Filtered employees:', filtered);

    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    currentPage = Math.max(currentPage, 1);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const paginatedEmployees = filtered.slice(startIndex, endIndex);

    let html = `
            <div class="card">
                <h2>Update or Remove User</h2>
                <div class="table-controls">
                    <div class="filter-controls">
                            <label>Show:</label>
                            <select id="records-per-page">
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
                            <label>Role:</label>
                            <select id="role-filter">
                                <option value="All" ${
                                  filterRole === 'All' ? 'selected' : ''
                                }>All</option>
                                <option value="User" ${
                                  filterRole === 'User' ? 'selected' : ''
                                }>Employee</option>
                                <option value="Manager" ${
                                  filterRole === 'Manager' ? 'selected' : ''
                                }>Manager</option>
                                <option value="HR" ${
                                  filterRole === 'HR' ? 'selected' : ''
                                }>HR</option>
                            </select>
                    </div>
                        <input type="text" id="search-input" placeholder="Search not available..." disabled>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="employees-table-body">
        `;

    paginatedEmployees.forEach((emp) => {
      html += `
                        <tr>
                            <td>${emp.employee_id}</td>
                            <td>${emp.first_name} ${emp.last_name}</td>
                            <td>${emp.email}</td>
                            <td>
                                <button class="update-btn" onclick="showEmployeeUpdateForm(${emp.employee_id})">Update</button>
                                <button class="remove-btn" onclick="removeEmployee(${emp.employee_id})">Remove</button>
                            </td>
                        </tr>
            `;
    });

    html += `
                    </tbody>
                </table>
                <div class="pagination">
                    <div>
                        Showing ${startIndex + 1} to ${Math.min(
      endIndex,
      totalRecords
    )} of ${totalRecords} employees
                    </div>
                    <div>
                        <button class="${
                          currentPage === 1 ? 'disabled' : ''
                        }" onclick="changePage(${
      currentPage - 1
    })">Previous</button>
        `;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `
                        <button class="${
                          i === currentPage ? 'active' : ''
                        }" onclick="changePage(${i})">${i}</button>
            `;
    }

    html += `
                        <button class="${
                          currentPage === totalPages ? 'disabled' : ''
                        }" onclick="changePage(${
      currentPage + 1
    })">Next</button>
                    </div>
                </div>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </div>
        `;

    updateRemoveUserSection.innerHTML = html;

    const roleFilterSelect = document.getElementById('role-filter');
    const recordsPerPageSelect = document.getElementById('records-per-page');

    if (roleFilterSelect) {
      roleFilterSelect.addEventListener('change', (e) => {
        filterRole = e.target.value;
        currentPage = 1;
        renderEmployeesTable();
      });
    }

    if (recordsPerPageSelect) {
      recordsPerPageSelect.addEventListener('change', (e) => {
        recordsPerPage = parseInt(e.target.value, 10);
        currentPage = 1;
        renderEmployeesTable();
      });
    }
  }

  window.changePage = function (page) {
    currentPage = page;
    renderEmployeesTable();
  };

  renderEmployeesTable();
}
function removeEmployee(employeeId) {
  // Show confirmation alert
  if (!confirm('Are you sure you want to deactivate this employee?')) {
    return; // If user clicks "Cancel", do nothing
  }

  // Find the employee in the employees array
  const employee = employeesadmin.find((emp) => emp.employee_id == employeeId);
  if (!employee) {
    alert('Employee not found in local data.');
    return;
  }

  // Check if the employee is a Manager with subordinates
  if (employee.role === 'Manager') {
    const subordinates = employeesadmin.filter(
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
            employeesadmin.length = 0; // Clear the array
            updatedEmployees.forEach((emp) => employeesadmin.push(emp)); // Repopulate with updated data
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

function showEmployeeUpdateForm(employeeId) {
  const emp = employeesadmin.find((e) => e.employee_id == employeeId);
  if (!emp) {
    alert('Employee not found!');
    return;
  }

  // Use showSection to ensure only profile-update-form is visible
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');
  if (!profileUpdateForm) {
    console.error('profile-update-form not found');
    showError('Profile update form section not found.', 'content-area');
    return;
  }

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

  const managers = employeesadmin.filter(
    (emp) =>
      emp.role === 'Manager' && emp.emp_status?.toLowerCase() !== 'inactive'
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
          <form method="POST" action="../pages/features/update_employee_superadmin.php" id="updateUserForm">
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
                      <option value="HR" ${
                        emp.role === 'HR' ? 'selected' : ''
                      }>HR</option>
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
                          const isSelected = empManagerId === managerEmployeeId;
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
                  <button type="button" onclick="showUpdateRemoveUserForm(event)">Back</button>
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
      if (originalValues.role === 'Manager' && currentValues.role === 'User') {
        const subordinates = employeesadmin.filter(
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
                employeesadmin.length = 0;
                updatedEmployees.forEach((emp) => employeesadmin.push(emp));
                showUpdateRemoveUserForm();
              })
              .catch((error) => {
                alert('Error fetching updated employee list: ' + error.message);
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
    console.error(
      'Form elements (updateUserForm, role, assign-manager-group, department_id, or manager_id) not found after rendering'
    );
    showError('Form setup error.', 'profile-update-form');
  }
}

function showDepartmentManagement(event) {
  if (event) event.preventDefault();
  console.log('showDepartmentManagement called');

  // Use showSection to ensure only department-management-section is visible
  if (!showSection('department-management-section')) {
    console.error('Failed to show department-management-section');
    return;
  }

  const departmentManagementSection = document.getElementById(
    'department-management-section'
  );
  if (!departmentManagementSection) {
    console.error('department-management-section not found');
    showError('Department management section not found.', 'content-area');
    return;
  }

  // Fetch departments on initial load
  fetch('../pages/features/fetch_departments.php?ts=' + new Date().getTime(), {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((fetchedDepartments) => {
      console.log('Initial fetch departments:', fetchedDepartments);
      if (!Array.isArray(fetchedDepartments)) {
        console.error(
          'Fetched departments is not an array:',
          fetchedDepartments
        );
        if (fetchedDepartments.success === false) {
          alert(
            'Error fetching departments: ' +
              (fetchedDepartments.message || 'Unknown error')
          );
        } else {
          alert('Error: Invalid department data from server');
        }
        return;
      }
      departments.length = 0; // Clear the array
      fetchedDepartments.forEach((dept) => departments.push(dept));
      console.log('Initial departments array:', departments);
      renderDepartmentList(); // Render the list after fetching
    })
    .catch((error) => {
      console.error('Error fetching initial department list:', error);
      alert('Error fetching initial department list: ' + error.message);
    });

  function renderDepartmentList() {
    console.log('renderDepartmentList called with departments:', departments);

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Department Management</h2>
          <button class="add-btn" id="add-department-btn">Add New Department</button>
        </div>
        <div id="add-department-form" style="display: none; margin-top: 20px;">
          <h3>Add New Department</h3>
          <form id="insertDepartmentForm">
            <div class="form-group">
              <label>Department ID</label>
              <input type="text" name="department_id" required>
            </div>
            <div class="form-group">
              <label>Name</label>
              <input type="text" name="department_name" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description"></textarea>
            </div>
            <div class="form-group button-group">
              <button type="submit">Add Department</button>
              <button type="button" id="cancel-add-department-btn">Cancel</button>
            </div>
          </form>
        </div>
        <table style="margin-top: 20px; width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #003087; color: #FFFFFF;">
              <th style="border: 1px solid #ddd; padding: 8px;">Department ID</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Actions</th>
            </tr>
          </thead>
          <tbody id="department-table-body">
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
            <td style="border: 1px solid #ddd; padding: 8px;">
              <button class="update-btn" data-dept-id="${
                dept.department_id
              }">Update</button>
              <button class="remove-btn" data-dept-id="${
                dept.department_id
              }">Delete</button>
            </td>
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
        <div class="form-group button-group" style="margin-top: 20px;">
          <button type="button" onclick="showWelcomeMessage(event)">Back</button>
        </div>
      </div>
    `;

    departmentManagementSection.innerHTML = html;

    // Attach event listeners dynamically
    const addDepartmentBtn = document.getElementById('add-department-btn');
    if (addDepartmentBtn) {
      addDepartmentBtn.addEventListener('click', showAddDepartmentForm);
    }

    const cancelAddDepartmentBtn = document.getElementById(
      'cancel-add-department-btn'
    );
    if (cancelAddDepartmentBtn) {
      cancelAddDepartmentBtn.addEventListener('click', hideAddDepartmentForm);
    }

    const updateButtons = document.querySelectorAll('.update-btn');
    updateButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const deptId = button.getAttribute('data-dept-id');
        showUpdateDepartmentForm(deptId);
      });
    });

    const deleteButtons = document.querySelectorAll('.remove-btn');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const deptId = button.getAttribute('data-dept-id');
        deleteDepartment(deptId);
      });
    });

    const insertForm = document.getElementById('insertDepartmentForm');
    if (insertForm) {
      insertForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(insertForm);
        fetch('../pages/features/insert_department.php', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log('Insert response:', data);
            if (data.success) {
              alert(data.message || 'Department added successfully');
              fetch(
                '../pages/features/fetch_departments.php?ts=' +
                  new Date().getTime(),
                {
                  method: 'GET',
                  headers: { 'Cache-Control': 'no-cache' },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((updatedDepartments) => {
                  console.log('Fetched departments:', updatedDepartments);
                  if (!Array.isArray(updatedDepartments)) {
                    console.error(
                      'Fetched departments is not an array:',
                      updatedDepartments
                    );
                    if (updatedDepartments.success === false) {
                      alert(
                        'Error fetching departments: ' +
                          (updatedDepartments.message || 'Unknown error')
                      );
                    } else {
                      alert('Error: Invalid department data from server');
                    }
                    return;
                  }
                  departments.length = 0;
                  updatedDepartments.forEach((dept) => departments.push(dept));
                  console.log('Updated departments array:', departments);
                  renderDepartmentList();
                  hideAddDepartmentForm();
                })
                .catch((error) => {
                  console.error(
                    'Error fetching updated department list:',
                    error
                  );
                  alert(
                    'Error fetching updated department list: ' + error.message
                  );
                });
            } else {
              alert(data.message || 'Error adding department');
            }
          })
          .catch((error) => {
            console.error('Error adding department:', error);
            alert('Error adding department: ' + error.message);
          });
      });
    }
  }

  function showAddDepartmentForm() {
    const addForm = document.getElementById('add-department-form');
    if (addForm) {
      addForm.style.display = 'block';
    }
  }

  function hideAddDepartmentForm() {
    const addForm = document.getElementById('add-department-form');
    if (addForm) {
      addForm.style.display = 'none';
      // Fix: Use querySelector to get the form element and reset it
      const formElement = addForm.querySelector('form');
      if (formElement) {
        formElement.reset();
      }
    }
  }

  // Note: renderDepartmentList is now called after the initial fetch
}

function deleteDepartment(departmentId) {
  const dept = departments.find((d) => d.department_id == departmentId);
  if (!dept) {
    alert('Department not found!');
    return;
  }

  // Check employee count on the frontend
  const employeeCount = parseInt(dept.employee_count || 0, 10);
  if (employeeCount > 0) {
    alert(
      `Cannot delete department: It has ${employeeCount} employee(s) assigned.`
    );
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete department with ID ${departmentId}?`
    )
  ) {
    return;
  }

  const formData = new FormData();
  formData.append('department_id', departmentId);

  fetch('../pages/features/delete_department.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert(data.message || 'Department deleted successfully');
        // Refresh the departments list
        fetch(
          '../pages/features/fetch_departments.php?ts=' + new Date().getTime(),
          {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' },
          }
        )
          .then((response) => response.json())
          .then((updatedDepartments) => {
            departments.length = 0;
            updatedDepartments.forEach((dept) => departments.push(dept));
            showDepartmentManagement();
          })
          .catch((error) => {
            alert('Error fetching updated department list: ' + error.message);
          });
      } else {
        alert(data.message || 'Error deleting department');
      }
    })
    .catch((error) => {
      alert('Error deleting department: ' + error.message);
    });
}

function showUpdateDepartmentForm(departmentId) {
  const dept = departments.find((d) => d.department_id == departmentId);
  if (!dept) {
    alert('Department not found!');
    return;
  }

  // Use showSection to ensure only department-management-section is visible
  if (!showSection('department-management-section')) return;

  const departmentManagementSection = document.getElementById(
    'department-management-section'
  );
  if (!departmentManagementSection) {
    console.error('department-management-section not found');
    showError('Department management section not found.', 'content-area');
    return;
  }

  departmentManagementSection.innerHTML = `
    <div class="card">
      <h2>Update Department</h2>
      <form method="POST" action="../pages/features/update_department.php" id="updateDepartmentForm">
        <input type="hidden" name="department_id" value="${dept.department_id}">
        <div class="form-group">
          <label>Department ID</label>
          <input type="text" name="department_id_display" value="${
            dept.department_id
          }" disabled>
        </div>
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="department_name" value="${
            dept.department_name
          }" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description">${dept.description || ''}</textarea>
        </div>
        <div class="form-group button-group">
          <button type="submit">Save Changes</button>
          <button type="button" onclick="showDepartmentManagement(event)">Back</button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('updateDepartmentForm');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert(data.message || 'Department updated successfully');
            // Refresh the departments list
            fetch(
              '../pages/features/fetch_departments.php?ts=' +
                new Date().getTime(),
              {
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache' },
              }
            )
              .then((response) => response.json())
              .then((updatedDepartments) => {
                departments.length = 0;
                updatedDepartments.forEach((dept) => departments.push(dept));
                showDepartmentManagement();
              })
              .catch((error) => {
                alert(
                  'Error fetching updated department list: ' + error.message
                );
              });
          } else {
            alert(data.message || 'Error updating department');
          }
        })
        .catch((error) => {
          alert('Error updating department: ' + error.message);
        });
    });
  }
}

// Show Project Overview
function trackProjectStatus() {
  if (!showSection('project-overview-section')) return;
  document.getElementById('project-overview-section').style.display = 'block';
  renderProjectOverview();

  // Add filter event listener
  document.getElementById('project-status-filter').onchange = () =>
    renderProjectOverview();
}

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

function showEmployeeDistribution() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');
  if (!profileUpdateForm) {
    showError('Profile update form section not found.', 'content-area');
    return;
  }

  // Fetch project assignments
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data&section=project_assignments',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.project_assignments) {
        // Group by project instead of employee
        const projectDistribution = data.project_assignments.reduce(
          (acc, assignment) => {
            const projectKey = assignment.project_name;
            if (!acc[projectKey]) {
              acc[projectKey] = {
                project_name: assignment.project_name,
                employees: [],
              };
            }
            acc[projectKey].employees.push({
              employee_name: `${assignment.first_name} ${assignment.last_name}`,
              role_in_project: assignment.role_in_project,
            });
            return acc;
          },
          {}
        );

        let html = `
          <div class="card">
            <h2>Employee Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Assigned Employees</th>
                </tr>
              </thead>
              <tbody>
        `;

        const projectList = Object.values(projectDistribution);
        if (projectList.length === 0) {
          html += `<tr><td colspan="2">No projects with assigned employees.</td></tr>`;
        } else {
          projectList.forEach((project) => {
            const employeeList = project.employees
              .map((emp) => `${emp.employee_name} (${emp.role_in_project})`)
              .join(', ');
            html += `
              <tr>
                <td>${project.project_name}</td>
                <td>${employeeList}</td>
              </tr>
            `;
          });
        }

        html += `
              </tbody>
            </table>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
              <button type="button" style="padding: 8px 12px; margin-left: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;" 
                      onmouseover="this.style.backgroundColor='#218838'" 
                      onmouseout="this.style.backgroundColor='#28a745'"
                      onclick="downloadEmployeeDistributionAsExcel()">Download more information</button>
            </div>
          </div>
        `;

        profileUpdateForm.innerHTML = html;
      } else {
        showError(
          data.error || 'Failed to fetch project distribution data',
          'profile-update-form'
        );
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'profile-update-form')
    );
}

function downloadEmployeeDistributionAsExcel() {
  // Fetch detailed data from the view via superadmin_dashboard.php
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=refresh_data&section=employee_task_project_view',
  })
    .then((response) => response.json())
    .then((data) => {
      if (
        !data.success ||
        !data.employee_task_project_view ||
        data.employee_task_project_view.length === 0
      ) {
        alert('No data available to download.');
        return;
      }

      // Prepare data for Excel
      const worksheetData = data.employee_task_project_view.map((row) => ({
        'Employee ID': row.employee_id,
        'Employee Name': row.employee_name,
        'Project ID': row.project_id,
        'Project Name': row.project_name,
        'Role in Project': row.role_in_project,
        'Project Status': row.assignment_status || 'N/A',
        'Task ID': row.task_id || 'N/A',
        'Task Description': row.task_description || 'N/A',
        'Task Status': row.task_status || 'N/A',
        'Due Date': row.due_date || 'N/A',
      }));

      // Create a worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Set column widths (in characters)
      worksheet['!cols'] = [
        { wch: 15 }, // Employee ID
        { wch: 25 }, // Employee Name
        { wch: 15 }, // Project ID
        { wch: 30 }, // Project Name
        { wch: 20 }, // Role in Project
        { wch: 20 }, // Project Status
        { wch: 15 }, // Task ID
        { wch: 40 }, // Task Description
        { wch: 20 }, // Task Status
        { wch: 15 }, // Due Date
      ];

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Employee_Distribution'
      );

      // Generate the Excel file and trigger download
      XLSX.writeFile(workbook, 'Employee_Distribution_Detailed.xlsx');
    })
    .catch((error) => {
      console.error('Error fetching data for download:', error);
      alert('Failed to fetch data for download: ' + error.message);
    });
}
// Function to track Task Status
function trackTasksStatus() {
  if (!showSection('profile-update-form')) return;

  const profileUpdateForm = document.getElementById('profile-update-form');
  if (!profileUpdateForm) {
    showError('Profile update form section not found.', 'content-area');
    return;
  }

  // Fetch task data (we'll need to add a new AJAX handler in superadmin_dashboard.php)
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=fetch_tasks_status',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.tasks) {
        let html = `
          <div class="card">
            <h2>Track Task Status</h2>
            <table>
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Task Description</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Assigned Employees</th>
                </tr>
              </thead>
              <tbody>
        `;

        if (data.tasks.length === 0) {
          html += `<tr><td colspan="5">No tasks found.</td></tr>`;
        } else {
          data.tasks.forEach((task) => {
            html += `
              <tr>
                <td>${task.task_id}</td>
                <td>${task.task_description}</td>
                <td>${task.project_name}</td>
                <td>${task.status}</td>
                <td>${task.assigned_employees || 'Not assigned'}</td>
              </tr>
            `;
          });
        }

        html += `
              </tbody>
            </table>
            <div class="form-group button-group">
              <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;

        profileUpdateForm.innerHTML = html;
      } else {
        showError(
          data.error || 'Failed to fetch task status data',
          'profile-update-form'
        );
      }
    })
    .catch((error) =>
      showError('Network error: ' + error.message, 'profile-update-form')
    );
}

// Define a separate array for Manage Departments
let manageDepartments = [];

function showDepartmentManagement(event) {
  if (event) event.preventDefault();
  console.log('showDepartmentManagement called');

  // Use showSection to ensure only department-management-section is visible
  if (!showSection('department-management-section')) {
    console.error('Failed to show department-management-section');
    return;
  }

  const departmentManagementSection = document.getElementById(
    'department-management-section'
  );
  if (!departmentManagementSection) {
    console.error('department-management-section not found');
    showError('Department management section not found.', 'content-area');
    return;
  }

  // Fetch departments on initial load
  fetch('../pages/features/fetch_departments.php?ts=' + new Date().getTime(), {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((fetchedDepartments) => {
      console.log('Initial fetch departments:', fetchedDepartments);
      if (!Array.isArray(fetchedDepartments)) {
        console.error(
          'Fetched departments is not an array:',
          fetchedDepartments
        );
        if (fetchedDepartments.success === false) {
          alert(
            'Error fetching departments: ' +
              (fetchedDepartments.message || 'Unknown error')
          );
        } else {
          alert('Error: Invalid department data from server');
        }
        return;
      }
      manageDepartments.length = 0; // Clear the array
      fetchedDepartments.forEach((dept) => manageDepartments.push(dept));
      console.log('Initial manageDepartments array:', manageDepartments);
      renderDepartmentList(); // Render the list after fetching
    })
    .catch((error) => {
      console.error('Error fetching initial department list:', error);
      alert('Error fetching initial department list: ' + error.message);
    });

  function renderDepartmentList() {
    console.log(
      'renderDepartmentList called with manageDepartments:',
      manageDepartments
    );

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Department Management</h2>
          <button class="add-btn" id="add-department-btn">Add New Department</button>
        </div>
        <div id="add-department-form" style="display: none; margin-top: 20px;">
          <h3>Add New Department</h3>
          <form id="insertDepartmentForm">
            <div class="form-group">
              <label>Department ID</label>
              <input type="text" name="department_id" required>
            </div>
            <div class="form-group">
              <label>Name</label>
              <input type="text" name="department_name" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description"></textarea>
            </div>
            <div class="form-group button-group">
              <button type="submit">Add Department</button>
              <button type="button" id="cancel-add-department-btn">Cancel</button>
            </div>
          </form>
        </div>
        <table style="margin-top: 20px; width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #003087; color: #FFFFFF;">
              <th style="border: 1px solid #ddd; padding: 8px;">Department ID</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Actions</th>
            </tr>
          </thead>
          <tbody id="department-table-body">
    `;

    if (manageDepartments.length > 0) {
      manageDepartments.forEach((dept) => {
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
            <td style="border: 1px solid #ddd; padding: 8px;">
              <button class="update-btn" data-dept-id="${
                dept.department_id
              }">Update</button>
              <button class="remove-btn" data-dept-id="${
                dept.department_id
              }">Delete</button>
            </td>
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
        <div class="form-group button-group" style="margin-top: 20px;">
          <button type="button" onclick="showWelcomeMessage(event)">Back</button>
        </div>
      </div>
    `;

    departmentManagementSection.innerHTML = html;

    // Attach event listeners dynamically
    const addDepartmentBtn = document.getElementById('add-department-btn');
    if (addDepartmentBtn) {
      addDepartmentBtn.addEventListener('click', showAddDepartmentForm);
    }

    const cancelAddDepartmentBtn = document.getElementById(
      'cancel-add-department-btn'
    );
    if (cancelAddDepartmentBtn) {
      cancelAddDepartmentBtn.addEventListener('click', hideAddDepartmentForm);
    }

    const updateButtons = document.querySelectorAll('.update-btn');
    updateButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const deptId = button.getAttribute('data-dept-id');
        showUpdateDepartmentForm(deptId);
      });
    });

    const deleteButtons = document.querySelectorAll('.remove-btn');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const deptId = button.getAttribute('data-dept-id');
        deleteDepartment(deptId);
      });
    });

    const insertForm = document.getElementById('insertDepartmentForm');
    if (insertForm) {
      insertForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(insertForm);
        fetch('../pages/features/insert_department.php', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log('Insert response:', data);
            if (data.success) {
              alert(data.message || 'Department added successfully');
              fetch(
                '../pages/features/fetch_departments.php?ts=' +
                  new Date().getTime(),
                {
                  method: 'GET',
                  headers: { 'Cache-Control': 'no-cache' },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((updatedDepartments) => {
                  console.log('Fetched departments:', updatedDepartments);
                  if (!Array.isArray(updatedDepartments)) {
                    console.error(
                      'Fetched departments is not an array:',
                      updatedDepartments
                    );
                    if (updatedDepartments.success === false) {
                      alert(
                        'Error fetching departments: ' +
                          (updatedDepartments.message || 'Unknown error')
                      );
                    } else {
                      alert('Error: Invalid department data from server');
                    }
                    return;
                  }
                  manageDepartments.length = 0;
                  updatedDepartments.forEach((dept) =>
                    manageDepartments.push(dept)
                  );
                  console.log(
                    'Updated manageDepartments array:',
                    manageDepartments
                  );
                  renderDepartmentList();
                  hideAddDepartmentForm();
                })
                .catch((error) => {
                  console.error(
                    'Error fetching updated department list:',
                    error
                  );
                  alert(
                    'Error fetching updated department list: ' + error.message
                  );
                });
            } else {
              alert(data.message || 'Error adding department');
            }
          })
          .catch((error) => {
            console.error('Error adding department:', error);
            alert('Error adding department: ' + error.message);
          });
      });
    }
  }

  function showAddDepartmentForm() {
    const addForm = document.getElementById('add-department-form');
    if (addForm) {
      addForm.style.display = 'block';
    }
  }

  function hideAddDepartmentForm() {
    const addForm = document.getElementById('add-department-form');
    if (addForm) {
      addForm.style.display = 'none';
      const formElement = addForm.querySelector('form');
      if (formElement) {
        formElement.reset();
      }
    }
  }

  function showUpdateDepartmentForm(deptId) {
    const dept = manageDepartments.find((d) => d.department_id === deptId);
    if (!dept) {
      alert('Department not found');
      return;
    }

    const formHtml = `
      <div class="card">
        <h3>Update Department</h3>
        <form id="updateDepartmentForm">
          <div class="form-group">
            <label>Department ID</label>
            <input type="text" name="department_id" value="${
              dept.department_id
            }" readonly>
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" name="department_name" value="${
              dept.department_name
            }" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description">${
              dept.department_description || ''
            }</textarea>
          </div>
          <div class="form-group button-group">
            <button type="submit">Update Department</button>
            <button type="button" id="cancel-update-department-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;

    departmentManagementSection.innerHTML = formHtml;

    const cancelUpdateDepartmentBtn = document.getElementById(
      'cancel-update-department-btn'
    );
    if (cancelUpdateDepartmentBtn) {
      cancelUpdateDepartmentBtn.addEventListener('click', () => {
        renderDepartmentList();
      });
    }

    const updateForm = document.getElementById('updateDepartmentForm');
    if (updateForm) {
      updateForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(updateForm);
        fetch('../pages/features/update_department.php', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log('Update response:', data);
            if (data.success) {
              alert(data.message || 'Department updated successfully');
              fetch(
                '../pages/features/fetch_departments.php?ts=' +
                  new Date().getTime(),
                {
                  method: 'GET',
                  headers: { 'Cache-Control': 'no-cache' },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((updatedDepartments) => {
                  console.log('Fetched departments:', updatedDepartments);
                  if (!Array.isArray(updatedDepartments)) {
                    console.error(
                      'Fetched departments is not an array:',
                      updatedDepartments
                    );
                    if (updatedDepartments.success === false) {
                      alert(
                        'Error fetching departments: ' +
                          (updatedDepartments.message || 'Unknown error')
                      );
                    } else {
                      alert('Error: Invalid department data from server');
                    }
                    return;
                  }
                  manageDepartments.length = 0;
                  updatedDepartments.forEach((dept) =>
                    manageDepartments.push(dept)
                  );
                  console.log(
                    'Updated manageDepartments array:',
                    manageDepartments
                  );
                  renderDepartmentList();
                })
                .catch((error) => {
                  console.error(
                    'Error fetching updated department list:',
                    error
                  );
                  alert(
                    'Error fetching updated department list: ' + error.message
                  );
                });
            } else {
              alert(data.message || 'Error updating department');
            }
          })
          .catch((error) => {
            console.error('Error updating department:', error);
            alert('Error updating department: ' + error.message);
          });
      });
    }
  }

  function deleteDepartment(deptId) {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    const formData = new FormData();
    formData.append('department_id', deptId);

    fetch('../pages/features/delete_department.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Delete response:', data);
        if (data.success) {
          alert(data.message || 'Department deleted successfully');
          fetch(
            '../pages/features/fetch_departments.php?ts=' +
              new Date().getTime(),
            {
              method: 'GET',
              headers: { 'Cache-Control': 'no-cache' },
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((updatedDepartments) => {
              console.log('Fetched departments:', updatedDepartments);
              if (!Array.isArray(updatedDepartments)) {
                console.error(
                  'Fetched departments is not an array:',
                  updatedDepartments
                );
                if (updatedDepartments.success === false) {
                  alert(
                    'Error fetching departments: ' +
                      (updatedDepartments.message || 'Unknown error')
                  );
                } else {
                  alert('Error: Invalid department data from server');
                }
                return;
              }
              manageDepartments.length = 0;
              updatedDepartments.forEach((dept) =>
                manageDepartments.push(dept)
              );
              console.log(
                'Updated manageDepartments array:',
                manageDepartments
              );
              renderDepartmentList();
            })
            .catch((error) => {
              console.error('Error fetching updated department list:', error);
              alert('Error fetching updated department list: ' + error.message);
            });
        } else {
          alert(data.message || 'Error deleting department');
        }
      })
      .catch((error) => {
        console.error('Error deleting department:', error);
        alert('Error deleting department: ' + error.message);
      });
  }
}

function showAuditLogs() {
  if (!showSection('audit-logs-section')) return;

  const auditLogsSection = document.getElementById('audit-logs-section');
  if (!auditLogsSection) {
    console.error('audit-logs-section not found');
    showError('Audit logs section not found.', 'content-area');
    return;
  }

  // State for pagination and filters
  let currentPage = 1;
  let recordsPerPage = 5;
  let userIdFilter = '';
  let actionKeyword = '';
  let startDate = '';
  let endDate = '';
  let filteredAuditLogs = []; // Store filtered logs for export

  // Predefined action keywords
  const actionKeywords = ['update', 'remove', 'login', 'request'];

  // Define exportToExcel globally
  window.exportAuditLogsToExcel = function () {
    console.log(
      'exportAuditLogsToExcel called, filteredAuditLogs:',
      filteredAuditLogs
    );
    if (!filteredAuditLogs || filteredAuditLogs.length === 0) {
      alert(
        'No data available to export. Please ensure there are audit logs to export.'
      );
      return;
    }

    // Prepare the data for export, including change_details
    const exportData = filteredAuditLogs.map((log) => ({
      'User ID': log.user_id || 'N/A',
      Action: log.action || 'N/A',
      'Action Date': log.action_date || 'N/A',
      'Change Details': log.change_details || 'N/A',
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');

    // Export the workbook to an Excel file
    XLSX.writeFile(wb, 'Audit_Logs.xlsx');
  };

  function renderTable() {
    // Fetch audit logs with filters
    fetch(
      `../pages/features/fetch_audit_logs.php?user_id=${encodeURIComponent(
        userIdFilter
      )}&action_keyword=${encodeURIComponent(
        actionKeyword
      )}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}&ts=${new Date().getTime()}`,
      {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          auditLogsSection.innerHTML = `
            <div class="card">
              <h2>Audit Logs</h2>
              <p class="error-message">${
                data.message || 'Error fetching audit logs.'
              }</p>
              <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
              </div>
            </div>
          `;
          return;
        }

        filteredAuditLogs = data.data; // Store filtered logs for export

        // If no audit logs
        if (filteredAuditLogs.length === 0) {
          auditLogsSection.innerHTML = `
            <div class="card">
              <h2>Audit Logs</h2>
              <p>No audit logs match the selected filters.</p>
              <div class="form-group button-group">
                <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
              </div>
            </div>
          `;
          return;
        }

        // Pagination
        const totalRecords = filteredAuditLogs.length;
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        currentPage = Math.max(currentPage, 1);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
        const paginatedLogs = filteredAuditLogs.slice(startIndex, endIndex);

        let auditLogsHTML = `
          <div class="card">
            <h2>Audit Logs</h2>
            <div class="table-controls">
              <div class="filter-controls">
                <label>User:</label>
                <select id="user-id-filter" class="filter-select">
                  <option value="">All</option>
                  ${employeesadmin
                    .map(
                      (emp) =>
                        `<option value="${emp.employee_id}" ${
                          userIdFilter === emp.employee_id ? 'selected' : ''
                        }>
                        ${emp.employee_id} - ${emp.first_name || ''} ${
                          emp.last_name || ''
                        }
                      </option>`
                    )
                    .join('')}
                </select>
                <label>Action Keyword:</label>
                <select id="action-keyword-filter" class="filter-select">
                  <option value="">All</option>
                  ${actionKeywords
                    .map(
                      (keyword) =>
                        `<option value="${keyword}" ${
                          actionKeyword === keyword ? 'selected' : ''
                        }>${keyword}</option>`
                    )
                    .join('')}
                </select>
                <label>Start Date:</label>
                <input type="date" id="start-date-filter" class="filter-date" value="${startDate}">
                <label>End Date:</label>
                <input type="date" id="end-date-filter" class="filter-date" value="${endDate}">
                <label>Show:</label>
                <select id="records-per-page" class="filter-select">
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
              </div>
            </div>
            <div class="button-group download-controls">
              <button class="download-btn" onclick="exportAuditLogsToExcel()">Download as Excel</button>
            </div>
            <table class="audit-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Action Date</th>
                </tr>
              </thead>
              <tbody>
        `;

        paginatedLogs.forEach((log, index) => {
          auditLogsHTML += `
            <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
              <td>${log.user_id || 'N/A'}</td>
              <td>${log.action || 'N/A'}</td>
              <td>${log.action_date || 'N/A'}</td>
            </tr>
          `;
        });

        auditLogsHTML += `
              </tbody>
            </table>
            <div class="pagination-container">
              <div>
                Showing ${startIndex + 1} to ${Math.min(
          endIndex,
          totalRecords
        )} of ${totalRecords} logs
              </div>
              <div>
                <button class="pagination-btn ${
                  currentPage === 1 ? 'disabled' : ''
                }" onclick="changePage(${currentPage - 1})">Previous</button>
        `;

        const maxPagesToShow = 5;
        let startPage = Math.max(
          1,
          currentPage - Math.floor(maxPagesToShow / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
          startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          auditLogsHTML += `
            <button class="pagination-btn ${
              i === currentPage ? 'active' : ''
            }" onclick="changePage(${i})">${i}</button>
          `;
        }

        auditLogsHTML += `
                <button class="pagination-btn ${
                  currentPage === totalPages ? 'disabled' : ''
                }" onclick="changePage(${currentPage + 1})">Next</button>
              </div>
            </div>
            <div class="form-group button-group">
              <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;

        auditLogsSection.innerHTML = auditLogsHTML;

        // Add event listeners for filters and pagination
        const userIdSelect = document.getElementById('user-id-filter');
        const actionKeywordSelect = document.getElementById(
          'action-keyword-filter'
        );
        const startDateInput = document.getElementById('start-date-filter');
        const endDateInput = document.getElementById('end-date-filter');
        const recordsPerPageSelect =
          document.getElementById('records-per-page');

        if (userIdSelect) {
          userIdSelect.addEventListener('change', (e) => {
            userIdFilter = e.target.value;
            currentPage = 1;
            renderTable();
          });
        }

        if (actionKeywordSelect) {
          actionKeywordSelect.addEventListener('change', (e) => {
            actionKeyword = e.target.value;
            currentPage = 1;
            renderTable();
          });
        }

        if (startDateInput) {
          startDateInput.addEventListener('change', (e) => {
            startDate = e.target.value;
            if (
              startDate &&
              endDate &&
              new Date(startDate) > new Date(endDate)
            ) {
              alert('Start date cannot be after end date.');
              startDate = '';
              startDateInput.value = '';
              return;
            }
            currentPage = 1;
            renderTable();
          });
        }

        if (endDateInput) {
          endDateInput.addEventListener('change', (e) => {
            endDate = e.target.value;
            if (
              startDate &&
              endDate &&
              new Date(startDate) > new Date(endDate)
            ) {
              alert('End date cannot be before start date.');
              endDate = '';
              endDateInput.value = '';
              return;
            }
            currentPage = 1;
            renderTable();
          });
        }

        if (recordsPerPageSelect) {
          recordsPerPageSelect.addEventListener('change', (e) => {
            recordsPerPage = parseInt(e.target.value, 10);
            currentPage = 1;
            renderTable();
          });
        }

        // Add hover effects for the back button
        const backButton = document.querySelector('.back-btn');
        if (backButton) {
          backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = '#5a6268';
          });
          backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = '#6c757d';
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching audit logs:', error);
        auditLogsSection.innerHTML = `
          <div class="card">
            <h2>Audit Logs</h2>
            <p class="error-message">Error fetching audit logs: ${error.message}</p>
            <div class="form-group button-group">
              <button type="button" class="back-btn" onclick="showWelcomeMessage()">Back</button>
            </div>
          </div>
        `;
      });
  }

  // Define global function for pagination
  window.changePage = function (page) {
    currentPage = page;
    renderTable();
  };

  // Initial render
  renderTable();
}

function showTrainingPrograms() {
  if (!showSection('training-programs')) return;

  const contentArea = document.getElementById('content-area');
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  const sections = [
    'main-content',
    'reports-analytics',
    'create-user-form',
    'update-remove-user-section',
    'profile-update-form',
    'Department_content',
    'department-management-section',
    'attendance-records',
    'leave-requests',
    'department-metrics',
    'training-programs',
    'training-assignments',
  ];
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'none';
  });

  const trainingSection = document.getElementById('training-programs');
  if (!trainingSection) {
    console.error('Training programs section not found');
    return;
  }
  trainingSection.style.display = 'block';
  contentArea.style.display = 'block';

  fetchTrainingData();
}

function fetchTrainingData() {
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=fetch_trainings',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.trainings = data.trainings || [];
        renderTrainingTable(data.trainings);
      } else {
        showError(
          data.error || 'Failed to fetch training data',
          'training-programs'
        );
      }
    })
    .catch((error) => {
      showError('Network error: ' + error.message, 'training-programs');
    });
}

function renderTrainingTable(trainings) {
  const tbody = document.getElementById('training-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  trainings.forEach((training) => {
    const duration = training.duration_days
      ? `${training.duration_days} days`
      : 'N/A';
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${escapeHTML(training.training_name)}</td>
          <td>${escapeHTML(training.department_name || 'N/A')}</td>
          <td>${escapeHTML(training.training_date)}</td>
          <td>${escapeHTML(training.end_date || 'N/A')}</td>
          <td>${escapeHTML(duration)}</td>
          <td>${escapeHTML(training.certificate)}</td>
      `;
    tbody.appendChild(row);
  });

  addTableSorting('training-table');
}

function showTrainingAssignments() {
  if (!showSection('training-assignments')) return;

  const contentArea = document.getElementById('content-area');
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  const sections = [
    'main-content',
    'reports-analytics',
    'create-user-form',
    'update-remove-user-section',
    'profile-update-form',
    'Department_content',
    'department-management-section',
    'attendance-records',
    'leave-requests',
    'department-metrics',
    'training-programs',
    'training-assignments',
  ];
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'none';
  });

  const assignmentsSection = document.getElementById('training-assignments');
  if (!assignmentsSection) {
    console.error('Training assignments section not found');
    return;
  }
  assignmentsSection.style.display = 'block';
  contentArea.style.display = 'block';

  fetchTrainingAssignments();

  const fetchBtn = document.getElementById('fetch-training-assignments-btn');
  if (fetchBtn) {
    const newFetchBtn = fetchBtn.cloneNode(true);
    fetchBtn.parentNode.replaceChild(newFetchBtn, fetchBtn);
    newFetchBtn.addEventListener('click', fetchTrainingAssignments);
  }
}

function fetchTrainingAssignments() {
  const trainingId = document.getElementById(
    'training-assignments-filter'
  ).value;
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=fetch_employee_trainings${
      trainingId ? `&training_id=${trainingId}` : ''
    }`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.employeeTrainings = data.employee_trainings || [];
        renderTrainingAssignmentsTable(
          data.employee_trainings,
          window.trainings || []
        );
      } else {
        showError(
          data.error || 'Failed to fetch training assignments',
          'training-assignments'
        );
      }
    })
    .catch((error) => {
      showError('Network error: ' + error.message, 'training-assignments');
    });
}

function renderTrainingAssignmentsTable(employeeTrainings, trainings) {
  const tbody = document.getElementById('training-assignments-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  employeeTrainings.forEach((training) => {
    const trainingInfo =
      trainings.find((t) => t.training_id == training.training_id) || {};
    const certificateName =
      training.completion_status === 'completed' &&
      trainingInfo.certificate === 'Yes'
        ? trainingInfo.training_name
        : 'N/A';
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>${escapeHTML(trainingInfo.training_name || 'N/A')}</td>
          <td>${escapeHTML(training.employee_name || 'N/A')}</td>
          <td>${escapeHTML(training.enrollment_date)}</td>
          <td><span class="status-badge status-${
            training.completion_status
          }">${escapeHTML(training.completion_status)}</span></td>
          <td>${training.score ? escapeHTML(training.score) : 'N/A'}</td>
          <td>${escapeHTML(certificateName)}</td>
      `;
    tbody.appendChild(row);
  });

  addTableSorting('training-assignments-table');
}

// Entry point for Performance Metrics
function showPerformanceMetrics() {
  if (!showSection('performance-metrics-section')) return;

  // Initialize the Top Performers tab with the default filter
  updateTopPerformers();

  // Fetch data for Training Champions and Attendance Stars
  fetchOtherMetrics();
}

// Function to update Top Performers based on the selected filter
function updateTopPerformers() {
  const filter = document.getElementById('top-performers-filter').value;
  let metricLabel = '';

  // Update the table header based on the selected filter
  switch (filter) {
    case 'tasks_completed':
      metricLabel = 'Tasks Completed';
      break;
    case 'average_feedback':
      metricLabel = 'Average Feedback';
      break;
    case 'combined_score':
      metricLabel = 'Combined Score';
      break;
  }
  const metricHeader = document.getElementById('top-performers-metric');
  if (metricHeader) {
    metricHeader.textContent = metricLabel;
  }

  // Fetch the filtered data
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=fetch_top_performers&filter=${filter}`,
  })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) return showError(d.error, 'top-performers-section');

      // Populate Top Performers table
      const tpTbody = document.querySelector('#top-performers-table tbody');
      if (tpTbody) {
        tpTbody.innerHTML = '';
        if (d.top_performers && Array.isArray(d.top_performers)) {
          d.top_performers.forEach((row) => {
            console.log('Row data:', row); // Log the row to see the data types
            let metricValue;
            if (filter === 'tasks_completed') {
              metricValue = row.tasks_completed;
            } else if (filter === 'average_feedback') {
              const avgFeedback = row.average_feedback
                ? parseFloat(row.average_feedback)
                : 0;
              metricValue = avgFeedback ? avgFeedback.toFixed(2) : 'N/A';
            } else {
              const combinedScore = row.combined_score
                ? parseFloat(row.combined_score)
                : 0;
              metricValue = combinedScore ? combinedScore.toFixed(2) : 'N/A';
            }
            tpTbody.innerHTML += `<tr>
    <td>${row.first_name} ${row.last_name}</td>
    <td>${metricValue}</td>
  </tr>`;
          });
        } else {
          tpTbody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
        }
      }
    })
    .catch((err) =>
      showError('Network error: ' + err.message, 'top-performers-section')
    );
}

function fetchOtherMetrics() {
  const monthFilter = document.getElementById('attendance-month-filter');
  const selectedMonth = monthFilter ? monthFilter.value : '2025-04'; // Fallback to default month
  fetch('superadmin_dashboard.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=fetch_performance_metrics&month=${selectedMonth}`
  })
  .then(r => r.json())
  .then(d => {
    console.log('fetchOtherMetrics response:', d); // Debug log
    if (!d.success) return showError(d.error, 'performance-metrics-section');

    // Training Champions
    const tcTbody = document.querySelector('#training-champions-table tbody');
    if (tcTbody) {
      tcTbody.innerHTML = '';
      if (d.training_champions && Array.isArray(d.training_champions)) {
        d.training_champions.forEach(row => {
          tcTbody.innerHTML += `<tr>
            <td>${row.first_name} ${row.last_name}</td>
            <td>${row.completed_trainings}</td>
          </tr>`;
        });
      } else {
        tcTbody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
      }
    }

    // Attendance Stars
    const asTbody = document.querySelector('#attendance-stars-table tbody');
    if (asTbody) {
      asTbody.innerHTML = '';
      if (d.attendance_stars && Array.isArray(d.attendance_stars)) {
        d.attendance_stars.forEach(row => {
          asTbody.innerHTML += `<tr>
            <td>${row.first_name} ${row.last_name}</td>
            <td>${(row.attendance_rate * 100).toFixed(1)}%</td>
          </tr>`;
        });
      } else {
        asTbody.innerHTML = '<tr><td colspan="2">No data available</td></tr>';
      }
    }
  })
  .catch(err => showError('Network error: ' + err.message, 'performance-metrics-section'));
}

// Tab click handler
document.addEventListener('click', (e) => {
  if (e.target.matches('.perf-tabs li')) {
    document
      .querySelectorAll('.perf-tabs li')
      .forEach((li) => li.classList.remove('active'));
    e.target.classList.add('active');
    const target = e.target.getAttribute('data-target');

    // Hide all panes
    document
      .querySelectorAll('.perf-pane')
      .forEach((sec) => (sec.style.display = 'none'));

    // Show the target pane if it exists
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.style.display = 'block';
    } else {
      console.error(`Element with ID "${target}" not found in the DOM.`);
      showError(
        `Tab section "${target}" not found.`,
        'performance-metrics-section'
      );
      return;
    }

    // If Top Performers tab is clicked, ensure the filter is applied
    if (target === 'top-performers-section') {
      updateTopPerformers();
    }
  }
});
