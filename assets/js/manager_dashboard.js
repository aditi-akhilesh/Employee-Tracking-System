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
            console.log("Updated employees array:", window.employees);
            console.log("Updated feedback array:", window.feedback);
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
    if (mainContent && profileUpdateForm && innerMainContent) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        profileUpdateForm.innerHTML = '';
    } else {
        console.error("DOM elements not found: content-area, main-content, or profile-update-form is null");
    }
}

// Show profile form
function showProfileForm() {
    console.log("showProfileForm called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    if (mainContent && profileUpdateForm && innerMainContent) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Manager Profile</h2>
            <form>
                <div class="form-group">
                    <label for="manager-name">Name:</label>
                    <input type="text" id="manager-name" value="${userName}" readonly>
                </div>
                <div class="form-group">
                    <label for="manager-id">Manager ID:</label>
                    <input type="text" id="manager-id" value="${managerId}" readonly>
                </div>
                <div class="form-group button-group">
                    <button type="button" onclick="showWelcomeMessage(event)">Back</button>
                </div>
            </form>
        `;
    } else {
        console.error("DOM elements not found: content-area, main-content, or profile-update-form is null");
    }
}

// Show feedback form
function showFeedbackForm() {
    console.log("showFeedbackForm called");
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    console.log("mainContent:", mainContent);
    console.log("profileUpdateForm:", profileUpdateForm);
    console.log("Employees array:", employees);
    if (mainContent && profileUpdateForm && innerMainContent) {
        console.log("Hiding main content and showing form...");
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
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
        console.error("DOM elements not found: content-area, main-content, or profile-update-form is null");
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

// Show feedback history
function showFeedbackHistory() {
    console.log("showFeedbackHistory called");
    console.log("Feedback array:", feedback);
    const mainContent = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    const innerMainContent = document.getElementById('main-content');
    if (mainContent && profileUpdateForm && innerMainContent) {
        mainContent.style.display = 'block';
        innerMainContent.style.display = 'none';
        profileUpdateForm.style.display = 'block';
        let feedbackTableHTML = `
            <h2>Feedback History</h2>
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
        if (feedback.length === 0) {
            feedbackTableHTML += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; box-sizing: border-box;" colspan="5">No feedback available.</td>
                </tr>
            `;
        } else {
            feedback.forEach(f => {
                feedbackTableHTML += `
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
        feedbackTableHTML += `
                </tbody>
            </table>
            <div class="form-group button-group" style="margin-top: 20px; text-align: center;">
                <button type="button" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" 
                        onmouseover="this.style.backgroundColor='#5a6268'" 
                        onmouseout="this.style.backgroundColor='#6c757d'"
                        onclick="showWelcomeMessage(event)">Back</button>
            </div>
        `;
        profileUpdateForm.innerHTML = feedbackTableHTML;
    } else {
        console.error("DOM elements not found: content-area, main-content, or profile-update-form is null");
    }
}

// Show error message
function showError(message, containerId = 'profile-update-form') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="alert alert-error">${message}</div>` + container.innerHTML;
    }
}