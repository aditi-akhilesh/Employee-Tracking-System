# Employee Tracking System

A web-based system for managing employees, attendance, projects, and more with role-based dashboards (User, Manager, HR, Super Admin).

## Features
- **Role-Based Access**: User (Employee), Manager, HR, and Super Admin dashboards.
- **Login**: Dropdown to select role (User, Manager, HR, Super Admin).
- **UI**: Blue-and-white theme with modern design and animations.
- **Modular Code**: Separated PHP, HTML, CSS, and JS for easy maintenance.

## Directory Structure
employee-tracking-system/
├── assets/           # Static assets (CSS, JS, images)
├── includes/         # Reusable PHP components
├── auth/             # Authentication logic
├── pages/            # Main pages (login, dashboards)
├── README.md         # This file
└── index.php         # Entry point


## Setup Instructions
1. **Requirements**: PHP 7+, a web server (e.g., Apache), and a browser.
2. **Installation**:
   - Clone or download this repository.
   - Place it in your web server directory (e.g., `htdocs` for XAMPP).
   - Navigate to `http://localhost/employee-tracking-system/` in your browser.
3. **Credentials**: Hardcoded in `auth/authenticate.php`:
   - User: `bob.brown@gmail.com` / `Bob@123`
   - Manager: `alice.johnson@gmail.com` / `Alice@123`
   - HR: `jane.smith@gmail.com` / `Jane@123`
   - Super Admin: `john.doe@gmail.com` / `John@123`

## Future Enhancements
- Replace hardcoded credentials with a database (e.g., MySQL).
- Add form submission handling for dashboard actions.
- Implement CSRF protection and input sanitization.

## Contributing
Feel free to fork this repository and submit pull requests for improvements!
