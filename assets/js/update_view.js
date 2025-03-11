// Improved reattachSidebarEvents to avoid eval and map onclick to functions
function reattachSidebarEvents() {
    console.log("reattachSidebarEvents called"); // Debugging
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        if (link.dataset.eventAttached) return; // Skip if already attached
        const onclick = link.getAttribute('onclick');
        if (onclick) {
            // Map onclick attributes to their corresponding functions
            if (onclick.includes('toggleDropdown')) {
                const dropdownIdMatch = onclick.match(/'([^']+)'/); // Extract dropdown ID
                if (dropdownIdMatch) {
                    const dropdownId = dropdownIdMatch[1];
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        toggleDropdown(event, dropdownId);
                    });
                }
            } else if (onclick.includes('showCreateUserForm')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showCreateUserForm();
                });
            } else if (onclick.includes('showViewEmployees')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showViewEmployees();
                });
            } else if (onclick.includes('showUpdateRemoveEmployees')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showUpdateRemoveEmployees();
                });
            } else if (onclick.includes('showAddProjectForm')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showAddProjectForm();
                });
            } else if (onclick.includes('showProjectStatus')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showProjectStatus();
                });
            } else if (onclick.includes('showWelcomeMessage')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    showWelcomeMessage();
                });
            }
            link.dataset.eventAttached = true; // Mark as attached
        }
    });
}

// Ensure reattachSidebarEvents is called after each content update
function showViewEmployees() {
    console.log("showViewEmployees called");
    alert("showViewEmployees called"); // Debug alert
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        // Hide existing content
        const welcomeHeading = contentArea.querySelector('h2');
        const welcomeMessage = contentArea.querySelector('p');
        if (welcomeHeading) welcomeHeading.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        // Debug: Log the fetch URL
        const url = '../pages/features/view_employees.php';
        console.log("Fetching View Employees from:", url);

        // Fetch content via AJAX
        fetch(url, {
            method: 'GET', // Reverted to GET since POST caused "Invalid request method" earlier
            credentials: 'include',
            redirect: 'manual'
        })
            .then(response => {
                console.log("Response status:", response.status);
                console.log("Response headers:", [...response.headers.entries()]);
                console.log("Response type:", response.type);
                if (response.status === 0 && response.type === 'opaqueredirect') {
                    throw new Error("Request redirected (likely to login.php). Check session authentication.");
                }
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
                    });
                }
                return response.text();
            })
            .then(data => {
                console.log("Successfully fetched View Employees data");
                contentArea.innerHTML = data;
                ensureStylesheet('../assets/css/view_employees.css');
                reattachSidebarEvents(); // Reattach sidebar events
            })
            .catch(error => {
                console.error("Error fetching View Employees:", error.message);
                contentArea.innerHTML = '<p>Error loading content. Please try again or ensure you are logged in.</p>';
            });
    } else {
        console.error("content-area not found");
    }
}

function showUpdateRemoveEmployees() {
    console.log("showUpdateRemoveEmployees called");
    alert("showUpdateRemoveEmployees called"); // Debug alert
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        // Hide existing content
        const welcomeHeading = contentArea.querySelector('h2');
        const welcomeMessage = contentArea.querySelector('p');
        if (welcomeHeading) welcomeHeading.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        // Debug: Log the fetch URL
        const url = '../pages/features/update_remove_employees.php';
        console.log("Fetching Update/Remove Employees from:", url);

        // Fetch content via AJAX
        fetch(url, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual'
        })
            .then(response => {
                console.log("Response status:", response.status);
                console.log("Response headers:", [...response.headers.entries()]);
                console.log("Response type:", response.type);
                if (response.status === 0 && response.type === 'opaqueredirect') {
                    throw new Error("Request redirected (likely to login.php). Check session authentication.");
                }
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
                    });
                }
                return response.text();
            })
            .then(data => {
                console.log("Successfully fetched Update/Remove Employees data");
                contentArea.innerHTML = data;
                ensureStylesheet('../assets/css/update_remove_employees.css');
                attachConfirmRemove();
                reattachSidebarEvents(); // Reattach sidebar events
            })
            .catch(error => {
                console.error("Error fetching Update/Remove Employees:", error.message);
                contentArea.innerHTML = '<p>Error loading content. Please try again or ensure you are logged in.</p>';
            });
    } else {
        console.error("content-area not found");
    }
}

function ensureStylesheet(href) {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    }

    function attachConfirmRemove() {
        const removeForms = document.querySelectorAll('form[onsubmit="return confirmRemove();"]');
        removeForms.forEach(form => {
            form.addEventListener('submit', function(event) {
                if (!confirmRemove()) {
                    event.preventDefault();
                }
            });
        });
    }
