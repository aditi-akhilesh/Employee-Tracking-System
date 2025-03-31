// manager_dashboard.js
// Refresh data from server
function refreshData(callback) {
    console.log("refreshData called with callback:", callback ? callback.name : 'none');
    fetch('manager_dashboard.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=refresh_data'
    })
    .then(response => {
        console.log("Fetch response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Refreshed data:", data);
        if (data.success) {
            window.employees = data.employees || employees;
            window.feedback = data.feedback || feedback;
            window.reportAvgRatings = data.report_avg_ratings || reportAvgRatings;
            window.reportFeedbackTypes = data.report_feedback_types || reportFeedbackTypes;
            console.log("Updated employees array:", window.employees);
            console.log("Updated feedback array:", window.feedback);
            console.log("Updated reportAvgRatings:", window.reportAvgRatings);
            console.log("Updated reportFeedbackTypes:", window.reportFeedbackTypes);
            if (callback) callback();
        } else {
            showError(data.error || 'Failed to refresh data');
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
        showError('Network error: ' + error.message);
    });
}

// Show welcome message
function showWelcomeMessage(event) {
    if (event) event.preventDefault();
    console.log("showWelcomeMessage called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    const reportsAnalytics = document.getElementById('reports-analytics');
    if (mainContent && profileUpdateForm && innerMainContent && reportsAnalytics) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        reportsAnalytics.style.display = 'none';
        profileUpdateForm.innerHTML = '';
    } else {
        console.error("DOM elements not found: content-area, main-content, profile-update-form, or reports-analytics is null");
    }
}

// Show profile form
// Show employees assigned to the manager
function showProfileForm() {
    console.log("showProfileForm called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    const reportsAnalytics = document.getElementById('reports-analytics');
    
    if (mainContent && profileUpdateForm && innerMainContent && reportsAnalytics) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        reportsAnalytics.style.display = 'none';

        // Check if there are employees assigned to the manager
        if (employees.length === 0) {
            console.log("No employees assigned to this manager.");
            profileUpdateForm.innerHTML = `
                <h2>Employees Assigned to Me</h2>
                <p>No employees are currently assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            `;
            return;
        }

        // Build the HTML for the employees table
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

        // Populate the table with employee data
        employees.forEach(emp => {
            employeesTableHTML += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${emp.first_name} ${emp.last_name}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${emp.emp_job_title || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${emp.email || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${emp.emp_status || 'N/A'}</td>
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
    } else {
        console.error("DOM elements not found: content-area, main-content, profile-update-form, or reports-analytics is null");
    }
}

// Show feedback form
function showFeedbackForm() {
    console.log("showFeedbackForm called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    const reportsAnalytics = document.getElementById('reports-analytics');
    console.log("mainContent:", mainContent);
    console.log("profileUpdateForm:", profileUpdateForm);
    console.log("Employees array:", employees);
    if (mainContent && profileUpdateForm && innerMainContent && reportsAnalytics) {
        console.log("Hiding main content and showing form...");
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        reportsAnalytics.style.display = 'none';
        if (employees.length === 0) {
            console.log("No employees found, displaying message...");
            profileUpdateForm.innerHTML = `
                <h2>Give Feedback to Employee</h2>
                <p>No employees assigned to you.</p>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            `;
            return;
        }
        console.log("Generating form HTML...");
        profileUpdateForm.innerHTML = `
            <h2>Give Feedback to Employee</h2>
            <form id="feedbackForm" method="POST">
                <div class="form-group">
                    <label for="employee_id">Employee:</label>
                    <select id="employee_id" name="employee_id" required>
                        <option value="">Select an employee</option>
                        ${employees.map(emp => `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name} (${emp.emp_job_title})</option>`).join('')}
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
        console.log("Form HTML set. Checking form element...");
        const form = document.getElementById('feedbackForm');
        console.log("Form element:", form);
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                if (!validateFeedbackForm(this)) return;

                fetch('../pages/features/manage_feedback.php', {
                    method: 'POST',
                    body: new FormData(this)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        refreshData(showFeedbackHistory); // Refresh data and show updated history
                    } else {
                        showError(data.error || 'Failed to submit feedback');
                    }
                })
                .catch(error => showError('Network error: ' + error.message));
            });
        } else {
            console.error("Feedback form not found after setting HTML");
        }
    } else {
        console.error("DOM elements not found: content-area, main-content, profile-update-form, or reports-analytics is null");
    }
}

// Validate feedback form
function validateFeedbackForm(form) {
    const rating = form.querySelector('#rating').value;
    if (rating < 1 || rating > 5) {
        alert("Rating must be between 1 and 5.");
        return false;
    }
    return true;
}

// Helper function to render the feedback table based on the selected employee
function renderFeedbackTable(selectedEmployeeId) {
    console.log("Rendering feedback table with selectedEmployeeId:", selectedEmployeeId);
    console.log("Feedback array:", feedback);

    // Convert selectedEmployeeId to a string to ensure consistent comparison
    const selectedId = selectedEmployeeId ? String(selectedEmployeeId) : '';

    // Filter feedback based on employee_id
    let filteredFeedback = feedback;
    if (selectedId) {
        filteredFeedback = feedback.filter(f => {
            const feedbackEmployeeId = String(f.employee_id); // Convert feedback employee_id to string
            console.log(`Comparing feedbackEmployeeId (${feedbackEmployeeId}) with selectedId (${selectedId})`);
            return feedbackEmployeeId === selectedId;
        });
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
        filteredFeedback.forEach(f => {
            tableHTML += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${f.first_name} ${f.last_name}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${f.rating || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${f.feedback_type || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${f.feedback_text || 'N/A'}</td>
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;">${f.date_submitted || 'N/A'}</td>
                </tr>
            `;
        });
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    return tableHTML;
}

// Show feedback history with employee filter
function showFeedbackHistory() {
    console.log("showFeedbackHistory called");
    console.log("Feedback array:", feedback);
    console.log("Employees array:", employees);
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    const reportsAnalytics = document.getElementById('reports-analytics');
    if (mainContent && profileUpdateForm && innerMainContent && reportsAnalytics) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        reportsAnalytics.style.display = 'none';

        // Start building the HTML with a dropdown for employee filtering
        let feedbackTableHTML = `
            <h2>Feedback History</h2>
            <div class="form-group">
                <label for="employee-filter">Filter by Employee:</label>
                <select id="employee-filter" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    <option value="">All Employees</option>
                    ${employees.map(emp => `<option value="${emp.employee_id}">${emp.first_name} ${emp.last_name}</option>`).join('')}
                </select>
            </div>
            <div id="feedback-table-container">
                ${renderFeedbackTable('')} <!-- Initial render with all feedback -->
            </div>
            <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                        onmouseover="this.style.backgroundColor='#5a6268'" 
                        onmouseout="this.style.backgroundColor='#6c757d'"
                        onclick="showWelcomeMessage(event)">Back</button>
            </div>
        `;

        profileUpdateForm.innerHTML = feedbackTableHTML;

        // Add event listener to the dropdown to filter the table
        const employeeFilter = document.getElementById('employee-filter');
        const tableContainer = document.getElementById('feedback-table-container');
        if (employeeFilter && tableContainer) {
            employeeFilter.addEventListener('change', function() {
                const selectedEmployeeId = this.value;
                tableContainer.innerHTML = renderFeedbackTable(selectedEmployeeId);
            });
        } else {
            console.error("Employee filter or table container not found");
        }
    } else {
        console.error("DOM elements not found: content-area, main-content, profile-update-form, or reports-analytics is null");
    }
}

// Function to load a script dynamically
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
        console.log(`Script loaded successfully: ${url}`);
        callback();
    };
    script.onerror = () => {
        console.error(`Failed to load script: ${url}`);
        callback(new Error(`Failed to load script: ${url}`));
    };
    document.head.appendChild(script);
}

// Show Reports and Analytics
function showReportsAnalytics() {
    console.log("showReportsAnalytics called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    const reportsAnalytics = document.getElementById('reports-analytics');
    const reportContent = document.getElementById('report-content');
    if (mainContent && profileUpdateForm && innerMainContent && reportsAnalytics && reportContent) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'none';
        reportsAnalytics.style.display = 'block';
        reportContent.style.display = 'none'; // Initially hide the report content

        // Add event listener for the Generate Report button
        const generateReportBtn = document.getElementById('generate-report-btn');
        const employeeSearch = document.getElementById('employee-search');
        if (generateReportBtn && employeeSearch) {
            generateReportBtn.addEventListener('click', function() {
                const selectedEmployeeId = employeeSearch.value;
                if (!selectedEmployeeId) {
                    alert("Please select an employee to generate the report.");
                    return;
                }

                // Filter data based on the selected employee
                const filteredAvgRatings = reportAvgRatings.filter(report => String(report.employee_id) === selectedEmployeeId);
                const filteredFeedback = feedback.filter(fb => String(fb.employee_id) === selectedEmployeeId);
                const filteredFeedbackTypes = reportFeedbackTypes.filter(type => {
                    const typeFeedback = filteredFeedback.filter(fb => fb.feedback_type === type.feedback_type);
                    return typeFeedback.length > 0;
                }).map(type => ({
                    feedback_type: type.feedback_type,
                    type_count: filteredFeedback.filter(fb => fb.feedback_type === type.feedback_type).length
                }));

                // Populate Average Ratings Table
                const avgRatingsTable = document.getElementById('avg-ratings-table');
                avgRatingsTable.innerHTML = '';
                if (filteredAvgRatings.length === 0) {
                    avgRatingsTable.innerHTML = `
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td>
                        </tr>
                    `;
                } else {
                    filteredAvgRatings.forEach(report => {
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
                    feedbackTypesTable.innerHTML = `
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td>
                        </tr>
                    `;
                } else {
                    filteredFeedbackTypes.forEach(report => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${report.feedback_type}</td>
                            <td>${report.type_count}</td>
                        `;
                        feedbackTypesTable.appendChild(row);
                    });
                }

                // Populate Feedback Summary Table
                const feedbackSummaryTable = document.getElementById('feedback-summary-table');
                feedbackSummaryTable.innerHTML = '';
                if (filteredFeedback.length === 0) {
                    feedbackSummaryTable.innerHTML = `
                        <tr>
                            <td colspan="5" style="padding: 10px; text-align: center;">No feedback data available for this employee.</td>
                        </tr>
                    `;
                } else {
                    filteredFeedback.forEach(fb => {
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

                // Show the report content
                reportContent.style.display = 'block';
            });
        }

        // Function to initialize the Download PDF button after libraries are loaded
        const initializeDownloadPdf = () => {
            const downloadPdfBtn = document.getElementById('download-pdf-btn');
            if (downloadPdfBtn) {
                downloadPdfBtn.addEventListener('click', function() {
                    console.log("Download PDF button clicked");
                    const reportContent = document.getElementById('report-content');
                    if (!reportContent) {
                        console.error("Report content element not found");
                        showError('Report content not found. Please generate the report first.');
                        return;
                    }

                    // Verify that html2canvas and jsPDF are loaded
                    if (typeof html2canvas === 'undefined') {
                        console.error("html2canvas is not loaded");
                        showError('html2canvas library is not loaded. PDF generation failed.');
                        return;
                    }
                    if (typeof window.jspdf === 'undefined') {
                        console.error("jsPDF is not loaded");
                        showError('jsPDF library is not loaded. PDF generation failed.');
                        return;
                    }

                    // Hide the Download PDF button before capturing
                    downloadPdfBtn.style.display = 'none';

                    console.log("Capturing report content with html2canvas...");
                    html2canvas(reportContent, { scale: 2 }).then(canvas => {
                        console.log("html2canvas completed, canvas generated");
                        const imgData = canvas.toDataURL('image/png');
                        console.log("Image data URL generated:", imgData.substring(0, 50) + "...");

                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const imgWidth = pageWidth - 20; // 10mm margin on each side
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        // Add company logo as watermark (optional)
                        try {
                            const logoUrl = '../assets/images/company-logo.png';
                            const logoWidth = 50;
                            const logoHeight = 50;
                            const logoX = (pageWidth - logoWidth) / 2;
                            const logoY = (pageHeight - logoHeight) / 2;
                            pdf.setGState(pdf.GState({ opacity: 0.1 }));
                            pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
                            pdf.setGState(pdf.GState({ opacity: 1 })); // Reset opacity to 1
                            console.log("Company logo added as watermark");
                        } catch (logoError) {
                            console.warn("Failed to add company logo as watermark:", logoError.message);
                            // Continue without the logo if it fails
                        }

                        // Ensure opacity is set to 1 for the report content
                        pdf.setGState(pdf.GState({ opacity: 1 }));

                        // Add the report content
                        let position = 10;
                        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                        console.log("Report content added to PDF");

                        // If the content is too long, add additional pages
                        let remainingHeight = imgHeight;
                        while (remainingHeight > pageHeight - 20) {
                            pdf.addPage();
                            position = 10;
                            remainingHeight -= (pageHeight - 20);
                            try {
                                const logoUrl = '../assets/images/company-logo.png';
                                const logoWidth = 50;
                                const logoHeight = 50;
                                const logoX = (pageWidth - logoWidth) / 2;
                                const logoY = (pageHeight - logoHeight) / 2;
                                pdf.setGState(pdf.GState({ opacity: 0.1 }));
                                pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
                                pdf.setGState(pdf.GState({ opacity: 1 })); // Reset opacity to 1
                            } catch (logoError) {
                                console.warn("Failed to add company logo on additional page:", logoError.message);
                            }
                            pdf.setGState(pdf.GState({ opacity: 1 })); // Ensure opacity is 1 for content
                            pdf.addImage(imgData, 'PNG', 10, position - remainingHeight, imgWidth, imgHeight);
                        }

                        // Save the PDF
                        const selectedEmployee = employeeSearch.options[employeeSearch.selectedIndex].text;
                        const fileName = `Employee_Report_${selectedEmployee}_${new Date().toISOString().split('T')[0]}.pdf`;
                        console.log("Saving PDF with filename:", fileName);
                        pdf.save(fileName);
                        console.log("PDF save method called successfully");

                        // Show the Download PDF button again after capturing
                        downloadPdfBtn.style.display = 'block';
                    }).catch(error => {
                        console.error("Error generating PDF with html2canvas:", error);
                        showError('Failed to generate PDF: ' + error.message);
                        // Ensure the button is visible even if an error occurs
                        downloadPdfBtn.style.display = 'block';
                    });
                });
            } else {
                console.error("Download PDF button not found");
            }
        };

        // Check if libraries are loaded, if not, load them dynamically
        const checkLibrariesAndInitialize = (retries = 3, delay = 1000) => {
            if (typeof html2canvas !== 'undefined' && typeof window.jspdf !== 'undefined') {
                console.log("Both html2canvas and jsPDF are loaded, initializing Download PDF...");
                initializeDownloadPdf();
            } else if (retries > 0) {
                console.log(`Libraries not loaded, retrying (${retries} attempts left)...`);
                // Attempt to load the libraries dynamically
                const loadHtml2Canvas = new Promise((resolve, reject) => {
                    if (typeof html2canvas !== 'undefined') return resolve();
                    loadScript('../assets/js/html2canvas.min.js', (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });
                const loadJsPDF = new Promise((resolve, reject) => {
                    if (typeof window.jspdf !== 'undefined') return resolve();
                    loadScript('../assets/js/jspdf.umd.min.js', (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                Promise.all([loadHtml2Canvas, loadJsPDF])
                    .then(() => {
                        console.log("Libraries loaded dynamically, initializing Download PDF...");
                        initializeDownloadPdf();
                    })
                    .catch(error => {
                        console.error("Failed to load libraries dynamically:", error);
                        setTimeout(() => checkLibrariesAndInitialize(retries - 1, delay), delay);
                    });
            } else {
                console.error("Failed to load html2canvas and/or jsPDF after retries");
                showError('Failed to load required libraries for PDF generation. Please try again later.');
            }
        };

        // Start the library check
        checkLibrariesAndInitialize();
    } else {
        console.error("DOM elements not found: content-area, main-content, profile-update-form, reports-analytics, or report-content is null");
    }
}

// Show error message
function showError(message, containerId = 'profile-update-form') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="alert alert-error">${message}</div>` + container.innerHTML;
    }
}