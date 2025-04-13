// user_dashboard.js

function showProfileForm() {
  const contentArea = document.getElementById('content-area');

  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  fetch('../pages/features/fetch_user_details.php')
    .then(response => {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers.get('Content-Type'));
      return response.text().then(text => {
        console.log('Raw response:', text);
        try {
          const data = JSON.parse(text);
          return { response, data };
        } catch (error) {
          throw new Error('Response is not valid JSON: ' + text);
        }
      });
    })
    .then(({ response, data }) => {
      if (data.error) {
        if (data.error === 'Not authenticated') {
          contentArea.innerHTML = `
            <h2>Profile Details</h2>
            <p style="color: #ff0000;">You are not authenticated. Please log in.</p>
            <div class="form-group button-group">
              <button type="button" onclick="window.location.href='../pages/login.php'">Log In</button>
            </div>
          `;
        } else {
          contentArea.innerHTML = `
            <h2>Profile Details</h2>
            <p style="color: #ff0000;">${data.error}</p>
            <div class="form-group button-group">
              <button type="button" onclick="showEmployeeWelcomeMessage()">Back</button>
            </div>
          `;
        }
        return;
      }

      // Render the form in view mode (read-only) with two fields side by side
      contentArea.innerHTML = `
        <div class="card">
          <h2>Profile Details</h2>
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label for="employee_id">Employee ID:</label>
                <input type="text" id="employee_id" name="employee_id" value="${data.employee_id}" readonly>
              </div>
              <div class="form-group">
                <label for="department_id">Department ID:</label>
                <input type="text" id="department_id" name="department_id" value="${data.department_id || ''}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="manager_id">Manager ID:</label>
                <input type="text" id="manager_id" name="manager_id" value="${data.manager_id || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="first_name">First Name:</label>
                <input type="text" id="first_name" name="first_name" value="${data.first_name}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="middle_name">Middle Name:</label>
                <input type="text" id="middle_name" name="middle_name" value="${data.middle_name || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="last_name">Last Name:</label>
                <input type="text" id="last_name" name="last_name" value="${data.last_name}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${data.email || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="phone_number">Phone Number:</label>
                <input type="tel" id="phone_number" name="phone_number" value="${data.phone_number || ''}" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" name="dob" value="${data.dob || ''}" readonly>
              </div>
              <div class="form-group">
                <label for="emp_hire_date">Hire Date:</label>
                <input type="date" id="emp_hire_date" name="emp_hire_date" value="${data.emp_hire_date || ''}" readonly>
              </div>
            </div>
            <div class="form-group">
              <label>Emergency Contacts:</label>
              <div id="emergency_contacts">
                ${
                  data.emergency_contacts && data.emergency_contacts.length > 0
                    ? data.emergency_contacts.map((contact, index) => `
                        <div class="emergency-contact" data-index="${index}">
                          <p><strong>Contact ${index + 1}:</strong></p>
                          <p>Name: <span class="contact-name">${contact.contact_name || ''}</span></p>
                          <p>Phone: <span class="contact-phone">${contact.contact_phone || ''}</span></p>
                          <p>Relationship: <span class="contact-relationship">${contact.relationship || ''}</span></p>
                        </div>
                      `).join('')
                    : '<p>No emergency contacts available.</p>'
                }
              </div>
            </div>
            <div class="form-group button-group">
              <button type="button" id="editProfileBtn">Edit Profile</button>
              <button type="button" onclick="showEmployeeWelcomeMessage()">Back</button>
            </div>
          </form>
        </div>
      `;

      // Add event listener for the Edit button
      const editProfileBtn = document.getElementById('editProfileBtn');
      const form = document.getElementById('profileForm');

      if (editProfileBtn && form) {
        editProfileBtn.addEventListener('click', function() {
          // Toggle to edit mode
          form.querySelectorAll('input, textarea').forEach(field => {
            // Allow editing only for email, phone_number, dob, and emergency contacts
            if (['email', 'phone_number', 'dob'].includes(field.id)) {
              field.removeAttribute('readonly');
            }
          });

          // Replace emergency contacts with editable fields
          const emergencyContactsDiv = document.getElementById('emergency_contacts');
          emergencyContactsDiv.innerHTML = `
            <div id="emergency_contacts_list">
              ${
                data.emergency_contacts && data.emergency_contacts.length > 0
                  ? data.emergency_contacts.map((contact, index) => `
                      <div class="emergency-contact" data-index="${index}">
                        <p><strong>Contact ${index + 1}:</strong></p>
                        <div class="form-group">
                          <label for="contact_name_${index}">Name:</label>
                          <input type="text" id="contact_name_${index}" name="emergency_contacts[${index}][contact_name]" value="${contact.contact_name || ''}">
                        </div>
                        <div class="form-group">
                          <label for="contact_phone_${index}">Phone:</label>
                          <input type="tel" id="contact_phone_${index}" name="emergency_contacts[${index}][contact_phone]" value="${contact.contact_phone || ''}" pattern="[0-9]{10}" placeholder="1234567890">
                        </div>
                        <div class="form-group">
                          <label for="relationship_${index}">Relationship:</label>
                          <input type="text" id="relationship_${index}" name="emergency_contacts[${index}][relationship]" value="${contact.relationship || ''}">
                        </div>
                        <button type="button" class="remove-contact-btn" data-index="${index}">Remove Contact</button>
                      </div>
                    `).join('')
                  : '<p>No emergency contacts available.</p>'
              }
            </div>
            <button type="button" id="add_contact_btn">Add Emergency Contact</button>
          `;

          // Add event listener for adding new emergency contacts
          const addContactBtn = document.getElementById('add_contact_btn');
          if (addContactBtn) {
            addContactBtn.addEventListener('click', function() {
              const contactList = document.getElementById('emergency_contacts_list');
              const index = document.querySelectorAll('.emergency-contact').length;
              const newContactHTML = `
                <div class="emergency-contact" data-index="${index}">
                  <p><strong>Contact ${index + 1}:</strong></p>
                  <div class="form-group">
                    <label for="contact_name_${index}">Name:</label>
                    <input type="text" id="contact_name_${index}" name="emergency_contacts[${index}][contact_name]" value="">
                  </div>
                  <div class="form-group">
                    <label for="contact_phone_${index}">Phone:</label>
                    <input type="tel" id="contact_phone_${index}" name="emergency_contacts[${index}][contact_phone]" value="" pattern="[0-9]{10}" placeholder="1234567890">
                  </div>
                  <div class="form-group">
                    <label for="relationship_${index}">Relationship:</label>
                    <input type="text" id="relationship_${index}" name="emergency_contacts[${index}][relationship]" value="">
                  </div>
                  <button type="button" class="remove-contact-btn" data-index="${index}">Remove Contact</button>
                </div>
              `;
              contactList.insertAdjacentHTML('beforeend', newContactHTML);
              addRemoveContactListeners();
            });
          }

          // Add event listeners for removing contacts
          function addRemoveContactListeners() {
            document.querySelectorAll('.remove-contact-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                document.querySelector(`.emergency-contact[data-index="${index}"]`).remove();
              });
            });
          }
          addRemoveContactListeners();

          // Change the button to Save and Cancel
          editProfileBtn.outerHTML = `
            <button type="submit" id="saveProfileBtn">Save Changes</button>
            <button type="button" id="cancelEditBtn">Cancel</button>
          `;

          // Add event listener for Cancel button
          const cancelEditBtn = document.getElementById('cancelEditBtn');
          if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
              showProfileForm(); // Reload the form in view mode
            });
          }
        });

        // Add event listener for form submission with DOB validation
        form.addEventListener('submit', function(event) {
          event.preventDefault();

          // Validate DOB (must be 18 years or older)
          const dobInput = document.getElementById('dob');
          if (dobInput && dobInput.value) {
            const dobValue = new Date(dobInput.value);
            const currentDate = new Date();
            if (isNaN(dobValue.getTime())) {
              alert('Please enter a valid date of birth.');
              return;
            }

            let age = currentDate.getFullYear() - dobValue.getFullYear();
            const monthDiff = currentDate.getMonth() - dobValue.getMonth();
            const dayDiff = currentDate.getDate() - dobValue.getDate();
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
              age--;
            }

            if (age < 18) {
              alert('You must be at least 18 years old.');
              return;
            }
          }

          const formData = new FormData(this);

          fetch('../pages/features/update_user_details.php', {
            method: 'POST',
            body: formData,
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              alert(result.message);
              showProfileForm(); // Reload the form with updated data
            } else {
              alert(result.error || 'Failed to update profile');
            }
          })
          .catch(error => alert('Network error: ' + error.message));
        });
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      contentArea.innerHTML = `
        <h2>Profile Details</h2>
        <p style="color: #ff0000;">Error fetching profile details: ${error.message}</p>
        <div class="form-group button-group">
          <button type="button" onclick="showEmployeeWelcomeMessage()">Back</button>
        </div>
      `;
    });
}

function showEmployeeWelcomeMessage() {
  console.log('showEmployeeWelcomeMessage called'); // Debug log
  const contentArea = document.getElementById('content-area');
  if (contentArea) {
    contentArea.style.display = 'block';
    contentArea.innerHTML = `
      <h2>Welcome,  ${userName} (Employee)</h2>
      <p>You are in Employee Dashboard, select an option from the menu on the left to get started.</p>
    `;
    console.log('Welcome message displayed in content-area'); // Debug log
  } else {
    console.error('content-area element not found');
  }
}

// user_dashboard.js (update showUpdatePasswordForm)

function showUpdatePasswordForm() {
  console.log('showUpdatePasswordForm called');
  const contentArea = document.getElementById('content-area');
  console.log('content-area element:', contentArea);
  if (!contentArea) {
    console.error('Content area not found');
    return;
  }

  contentArea.innerHTML = `
    <div id="profile-update-form">
      <div class="card">
        <h2>Update Password</h2>
        <p style="color: #555; margin-bottom: 15px;">
          Password must be at least 12 characters long and include:
          <ul style="margin-top: 5px; padding-left: 20px; font-size: 14px; color: #6C757D;">
            <li>At least one uppercase letter (A-Z)</li>
            <li>At least one lowercase letter (a-z)</li>
            <li>At least one number (0-9)</li>
            <li>At least one special character (!@#$%^&*)</li>
            <li>No repetitive patterns (e.g., "aaaa", "1234")</li>
            <li>No common words (e.g., "password", "admin")</li>
          </ul>
        </p>
        <form id="updatePasswordForm">
          <div class="form-row">
            <div class="form-group">
              <label for="new_password">New Password:</label>
              <input type="password" id="new_password" name="new_password" required>
            </div>
            <div class="form-group">
              <label for="confirm_password">Confirm Password:</label>
              <input type="password" id="confirm_password" name="confirm_password" required>
            </div>
          </div>
          <div class="form-group">
            <div style="display: flex; align-items: center; margin-top: 15px; margin-bottom: 20px;">
              <input type="checkbox" id="showPassword" style="margin-right: 15px; width: 16px; height: 16px; cursor: pointer; vertical-align: middle; position: relative; top: -1px;">
              <label for="showPassword" style="font-weight: normal; color: #007bff; margin: 0; font-size: 14px; cursor: pointer; line-height: 1;">Show Password</label>
            </div>
          </div>
          <div class="form-group button-group">
            <button type="submit" id="savePasswordBtn">Save</button>
            <button type="button" onclick="showEmployeeWelcomeMessage()">Back</button>
          </div>
        </form>
      </div>
    </div>
  `;
  console.log('Update Password form rendered in content-area');

  // Ensure the form is visible
  const profileUpdateForm = document.getElementById('profile-update-form');
  if (profileUpdateForm) {
    profileUpdateForm.style.display = 'block';
    console.log('profile-update-form set to display: block');
  } else {
    console.error('profile-update-form element not found after rendering');
  }

  // Add event listener for the Show Password checkbox
  const showPasswordCheckbox = document.getElementById('showPassword');
  const newPasswordInput = document.getElementById('new_password');
  const confirmPasswordInput = document.getElementById('confirm_password');

  if (showPasswordCheckbox && newPasswordInput && confirmPasswordInput) {
    showPasswordCheckbox.addEventListener('change', function() {
      const type = this.checked ? 'text' : 'password';
      newPasswordInput.type = type;
      confirmPasswordInput.type = type;
    });
  }

  // Add event listener for form submission
  const updatePasswordForm = document.getElementById('updatePasswordForm');
  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validation 1: Check if passwords match
      if (newPassword !== confirmPassword) {
        contentArea.innerHTML = `
          <div id="profile-update-form">
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                Passwords do not match.
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          </div>
        `;
        const profileUpdateFormAfterError = document.getElementById('profile-update-form');
        if (profileUpdateFormAfterError) {
          profileUpdateFormAfterError.style.display = 'block';
        }
        return;
      }

      // Validation 2: Strong password rules
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
      if (!passwordRegex.test(newPassword)) {
        contentArea.innerHTML = `
          <div id="profile-update-form">
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          </div>
        `;
        const profileUpdateFormAfterError = document.getElementById('profile-update-form');
        if (profileUpdateFormAfterError) {
          profileUpdateFormAfterError.style.display = 'block';
        }
        return;
      }

      // Validation 3: Check for repetitive patterns
      const repetitivePatternRegex = /(.)\1{3,}|(?:0123|1234|2345|3456|4567|5678|6789|7890)/;
      if (repetitivePatternRegex.test(newPassword)) {
        contentArea.innerHTML = `
          <div id="profile-update-form">
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                Password contains repetitive or predictable patterns (e.g., "aaaa" or "1234"). Please use a more complex password.
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          </div>
        `;
        const profileUpdateFormAfterError = document.getElementById('profile-update-form');
        if (profileUpdateFormAfterError) {
          profileUpdateFormAfterError.style.display = 'block';
        }
        return;
      }

      // Validation 4: Check for common words
      const commonWords = ['password', 'admin', 'user', '123456', 'qwerty'];
      const lowerCasePassword = newPassword.toLowerCase();
      if (commonWords.some(word => lowerCasePassword.includes(word))) {
        contentArea.innerHTML = `
          <div id="profile-update-form">
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                Password contains a common word or phrase (e.g., "password", "admin"). Please use a more unique password.
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          </div>
        `;
        const profileUpdateFormAfterError = document.getElementById('profile-update-form');
        if (profileUpdateFormAfterError) {
          profileUpdateFormAfterError.style.display = 'block';
        }
        return;
      }

      // If all validations pass, send the new password to the backend
      const formData = new FormData();
      formData.append('new_password', newPassword);

      fetch('../pages/features/update_password.php', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          contentArea.innerHTML = `
            <div id="profile-update-form">
              <div class="card">
                <h2>Update Password</h2>
                <div class="alert" style="color: green; padding: 10px; border: 1px solid green; border-radius: 4px; margin-bottom: 20px;">
                  ${result.message}
                </div>
              </div>
            </div>
          `;
          const profileUpdateFormAfterSuccess = document.getElementById('profile-update-form');
          if (profileUpdateFormAfterSuccess) {
            profileUpdateFormAfterSuccess.style.display = 'block';
          }
          setTimeout(() => {
            showEmployeeWelcomeMessage();
          }, 1500);
        } else {
          contentArea.innerHTML = `
            <div id="profile-update-form">
              <div class="card">
                <h2>Update Password</h2>
                <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                  ${result.error || 'Failed to update password'}
                </div>
                ${updatePasswordForm.outerHTML}
              </div>
            </div>
          `;
          const profileUpdateFormAfterError = document.getElementById('profile-update-form');
          if (profileUpdateFormAfterError) {
            profileUpdateFormAfterError.style.display = 'block';
          }
        }
      })
      .catch(error => {
        contentArea.innerHTML = `
          <div id="profile-update-form">
            <div class="card">
              <h2>Update Password</h2>
              <div class="alert" style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin-bottom: 20px;">
                Network error: ${error.message}
              </div>
              ${updatePasswordForm.outerHTML}
            </div>
          </div>
        `;
        const profileUpdateFormAfterError = document.getElementById('profile-update-form');
        if (profileUpdateFormAfterError) {
          profileUpdateFormAfterError.style.display = 'block';
        }
      });
    });
  }
}