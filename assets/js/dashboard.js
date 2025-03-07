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