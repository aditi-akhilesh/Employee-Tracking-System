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
        alert("Button Clicked! Function is working."); // Debugging step
        console.log("showCreateUserForm called");
        const contentArea = document.getElementById('content-area');
        const profileUpdateForm = document.getElementById('profile-update-form');
        if (contentArea && profileUpdateForm) {
            // Hide existing h2 and p elements in content-area
            const welcomeHeading = contentArea.querySelector('h2');
            const welcomeMessage = contentArea.querySelector('p');
            if (welcomeHeading) welcomeHeading.style.display = 'none';
            if (welcomeMessage) welcomeMessage.style.display = 'none';

            // Show and populate the form
            profileUpdateForm.style.display = 'block';
            profileUpdateForm.innerHTML = `
                <h2>Create New User</h2>
                <form action="../pages/features/create_user.php" method="POST" onsubmit="if (this.department_id.value === '') { alert('Please select a department'); return false; }">
                    <div class="form-group">
                        <label for="first_name">First Name:</label>
                        <input type="text" id="first_name" name="first_name" required>
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
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
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
function showProfileForm() {
    const contentArea = document.getElementById('content-area');

    // Simulated user data from session (to be replaced with actual DB fetch later)
    const user = {
        first_name: 'Aditya',
        last_name: 'S',
        employee_id: 'EMP001', // Placeholder, replace with actual ID later
        dpt_id: 'D001',       // Placeholder, replace with actual dept ID
        email: 'aditya@gmail.com',
        phone: '123-456-7890',
        street: '123 Main St',
        apartment: 'Apt 4B',
        city: 'Springfield',
        zip: '62701',
        country: 'USA'
    };

    contentArea.innerHTML = `
        <div class="profile-details">
            <h2>View and Update Personal Details</h2>
            <form class="update-form" id="profile-update-form" action="../auth/update_profile.php" method="post">
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" value="${user.first_name}" readonly>
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" value="${user.last_name}" readonly>
                </div>
                <div class="form-group">
                    <label for="employee_id">Employee ID:</label>
                    <input type="text" id="employee_id" name="employee_id" value="${user.employee_id}" readonly>
                </div>
                <div class="form-group">
                    <label for="dpt_id">Department ID:</label>
                    <input type="text" id="dpt_id" name="dpt_id" value="${user.dpt_id}" readonly>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${user.email}" readonly>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number:</label>
                    <input type="tel" id="phone" name="phone" value="${user.phone}">
                </div>
                <div class="form-group">
                    <label for="street">Street Name:</label>
                    <input type="text" id="street" name="street" value="${user.street}">
                </div>
                <div class="form-group">
                    <label for="apartment">Apartment:</label>
                    <input type="text" id="apartment" name="apartment" value="${user.apartment}">
                </div>
                <div class="form-group">
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" value="${user.city}">
                </div>
                <div class="form-group">
                    <label for="zip">ZIP Code:</label>
                    <input type="text" id="zip" name="zip" value="${user.zip}">
                </div>
                <div class="form-group">
                    <label for="country">Country:</label>
                    <input type="text" id="country" name="country" value="${user.country}">
                </div>
                <button type="submit" class="update-btn" id="update-btn" disabled>Update Profile</button>
            </form>
        </div>
    `;

    // Enable update button when changes are made
    const form = document.getElementById('profile-update-form');
    const updateBtn = document.getElementById('update-btn');
    const editableInputs = form.querySelectorAll('input:not([readonly])');

    editableInputs.forEach(input => {
        const originalValue = input.value;
        input.addEventListener('input', function() {
            let hasChanges = false;
            editableInputs.forEach(inp => {
                if (inp.value !== inp.defaultValue) {
                    hasChanges = true;
                }
            });
            updateBtn.disabled = !hasChanges;
        });
    });
}