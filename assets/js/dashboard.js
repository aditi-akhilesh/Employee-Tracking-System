function toggleDropdown(event, id) {
    event.preventDefault();
    const allDropdowns = document.querySelectorAll('.dropdown');
    allDropdowns.forEach(dropdown => {
        if (dropdown.id !== id) {
            dropdown.style.opacity = '0';
            setTimeout(() => dropdown.style.display = 'none', 200);
        }
    });
    const currentDropdown = document.getElementById(id);
    if (currentDropdown.style.display === 'block') {
        currentDropdown.style.opacity = '0';
        setTimeout(() => currentDropdown.style.display = 'none', 200);
    } else {
        currentDropdown.style.display = 'block';
        setTimeout(() => currentDropdown.style.opacity = '1', 10);
    }
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.sidebar')) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.style.opacity = '0';
            setTimeout(() => dropdown.style.display = 'none', 200);
        });
    }
});

function showCreateUserForm() {
    // Existing implementation remains unchanged
    const contentArea = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (contentArea && profileUpdateForm) {
        const welcomeHeading = contentArea.querySelector('h2');
        const welcomeMessage = contentArea.querySelector('p');
        if (welcomeHeading) welcomeHeading.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Create New User</h2>
            <form action="../pages/features/create_user.php" method="POST" onsubmit="if (this.department_id.value === '') { alert('Please select a department'); return false; }">
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" required>
                </div>
                <div class="form-group">
                    <label for="middle_name">Middle Name (Optional):</label>
                    <input type="text" id="middle_name" name="middle_name">
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
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
                    <label for="role">Role:</label>
                    <select id="role" name="role" required>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="department_id">Department:</label>
                    <select id="department_id" name="department_id" required>
                        <option value="">Select a department</option>
                        ${departments.map(dept => `<option value="${dept.department_id}">${dept.department_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group button-group">
                    <button type="submit">Create User</button>
                    <button type="button" onclick="showWelcomeMessage()">Back</button>
                </div>
            </form>
        `;
    } else {
        console.error("content-area or profile-update-form not found");
    }
}

function showWelcomeMessage() {
    // Existing implementation remains unchanged
    const contentArea = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (contentArea && profileUpdateForm) {
        const welcomeHeading = contentArea.querySelector('h2');
        const welcomeMessage = contentArea.querySelector('p');
        if (welcomeHeading) welcomeHeading.style.display = 'block';
        if (welcomeMessage) welcomeMessage.style.display = 'block';
        profileUpdateForm.style.display = 'none';
        profileUpdateForm.innerHTML = '';
    } else {
        console.error("content-area or profile-update-form not found");
    }
}

function showDepartmentInfo() {
    const contentArea = document.getElementById('content-area');
    const profileUpdateForm = document.getElementById('profile-update-form');
    if (contentArea && profileUpdateForm) {
        // Hide welcome message
        const welcomeHeading = contentArea.querySelector('h2');
        const welcomeMessage = contentArea.querySelector('p');
        if (welcomeHeading) welcomeHeading.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        profileUpdateForm.style.display = 'block';
        profileUpdateForm.innerHTML = `
            <h2>Track Department Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Department ID</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Employee Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${departments.length > 0 ? departments.map(dept => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${dept.department_id}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${dept.department_name}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${dept.department_description || 'No description'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${dept.employee_count}</td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No departments found.</td>
                        </tr>
                    `}
                </tbody>
            </table>
            <div class="form-group button-group" style="margin-top: 20px;">
                <button type="button" onclick="showWelcomeMessage()">Back</button>
            </div>
        `;
    } else {
        console.error("content-area or profile-update-form not found");
    }
}