<?php
session_start();
if (!isset($_SESSION['user_email'])) {
    header("Location: admin_login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        header {
        background-color:#333;
        color: white;
        padding: 1em;
        text-align: center; /* Center the header text */
        display: flex;
        justify-content: space-between;
        align-items: center;
    }        
      header h1 {
        margin: 0;
        flex-grow: 1; /* This will help center the title */
    }        .logout {
            margin-right: 1em;
        }
        .logout a {
            color: white;
            text-decoration: none;
            font-size: 1em;
        }
        .logout a:hover {
            text-decoration: underline;
        }
        .dashboard-container {
            display: flex;
            height: calc(100vh - 60px); /* Adjust height minus header */
        }
        .sidebar {
            width: 250px;
            background-color:#333;
            color: white;
            padding: 1em;
        }
        .sidebar ul {
            list-style-type: none;
            padding: 0;
        }
        .sidebar ul li {
            margin-bottom: 1em;
            position: relative; /* Needed for dropdown positioning */
        }
        .sidebar ul li a {
            color: white;
            text-decoration: none;
            display: block;
            padding: 0.5em 1em;
            border-radius: 5px;
        }
        .sidebar ul li a:hover {
            background-color: #575757;
        }
        .dropdown {
            display: none; /* Hide dropdown by default */
            margin-left: 1em; /* Indent dropdown items */
        }
        .dropdown a {
            font-size: 0.9em; /* Smaller font for dropdown items */
        }
        .dropdown a:hover {
            background-color: #575757;
        }
        .content {
            flex-grow: 1;
            padding: 2em;
            background-color: white;
            overflow-y: auto; /* Allow scrolling for large content */
        }
       .profile-details {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
}

.update-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.update-btn {
    grid-column: 1 / -1;
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
}

.update-btn:hover {
    background-color: #45a049;
}

    </style>
    <script>
        function showProfileForm() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="profile-details">
            <h2>Personal Details</h2>
            <form class="update-form">
               
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" >
                </div>

                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name">
                </div>

                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email"  >
                </div>                
                    <div class="form-group">
                    <label for="phone">Phone Number:</label>
                    <input type="tel" id="phone" >
                </div>

                <div class="form-group">
                    <label for="street">Street Name:</label>
                    <input type="text" id="street" >
                </div>

                <div class="form-group">
                    <label for="apartment">Apartment:</label>
                    <input type="text" id="apartment">
                </div>

                <div class="form-group">
                    <label for="city">City:</label>
                    <input type="text" id="city" >
                </div>

                <div class="form-group">
                    <label for="zip">ZIP Code:</label>
                    <input type="text" id="zip" >
                </div>

                <div class="form-group">
                    <label for="country">Country:</label>
                    <input type="text" id="country" >
                </div>

                <button type="submit" class="update-btn">Create profile</button>
            </form>
        </div>
    `;
}

        // JavaScript to handle dropdown visibility
        function toggleDropdown(event, id) {
            event.preventDefault(); // Prevent default link behavior

            // Close all other dropdowns
            const allDropdowns = document.querySelectorAll('.dropdown');
            allDropdowns.forEach(dropdown => {
                if (dropdown.id !== id) {
                    dropdown.style.display = 'none';
                }
            });

            // Toggle the clicked dropdown
            const currentDropdown = document.getElementById(id);
            currentDropdown.style.display =
                currentDropdown.style.display === 'block' ? 'none' : 'block';
        }

        // Close all dropdowns when clicking outside
        document.addEventListener('click', function (event) {
            const isClickInsideSidebar = event.target.closest('.sidebar');
            
			if (!isClickInsideSidebar) { 
				const allDropdowns = document.querySelectorAll('.dropdown'); 
				allDropdowns.forEach(dropdown => { 
					dropdown.style.display = 'none'; 
				}); 
			} 
		}); 

  
	</script>	
</head>	
<body>	
<header>	
	<h1>Admin Dashboard</h1>	
	<div class="logout">	
		<a href="logout.php">Logout</a>	
	</div>	
</header>	

<div class="dashboard-container">	
	<!-- Sidebar -->	
	<div class="sidebar">	
		<ul>	
			<!-- Profile Management -->	
			<li><a href="#" onclick="toggleDropdown(event, 'manage-dropdown')">Manage Employees</a>	
				<ul id="manage-dropdown" class="dropdown">	
					<li><a href="#" onclick="showProfileForm()">Create new profile</a></li>	
					<li><a href="#">Update or remove employee</a></li>
				</ul>	
			</li>	

			<!-- Attendance & Leaves -->	
			<li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')">Attendance and Leave Management</a>	
				<ul id="attendance-dropdown" class="dropdown">	
					<li><a href="#">View attendance records of employees</a></li>	
					<li><a href="#">Approve/reject leave requests</a></li>	
					<li><a href="#">Track employee working hours</a></li>	
				</ul>	
			</li>	

			<!-- Payroll & Salary -->	
			<li><a href="#" onclick="toggleDropdown(event, 'payroll-dropdown')">Payroll Management</a>	
				<ul id="payroll-dropdown" class="dropdown">	
					<li><a href="#">Process bonuses and deductions</a></li>	
					<li><a href="#">Generate and update salary details</a></li>	
				</ul>	
			</li>
                                    <!-- Department Management-->
			<li><a href="#" onclick="toggleDropdown(event,'Department-dropdown')">Department Management</a>
				<ul id="Department-dropdown" class="dropdown">
					<li><a href="#">Assign employees to department</a></li>
                                                            <li><a href="#">Track department information</a></li>
				</ul>
			</li>

		           <!-- Projects & Tasks -->
			<li><a href="#" onclick="toggleDropdown(event,'project-dropdown')">Projects and Tasks</a>
				<ul id="project-dropdown" class="dropdown">
					<li><a href="#">Assign employees to projects</a></li>
                                                            <li><a href="#">Assign tasks to employee</a></li>
					<li><a href="#">Track project and task status</a></li>
				</ul>
			</li>

			<!-- Training & Performance -->
			<li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')">Training and Performance</a>
				<ul id="training-dropdown" class="dropdown">
					<li><a href="#">Add/manage training programs</a></li>
					<li><a href="#">Assign employees to training</a></li>
					<li><a href="#">Conduct and record performance reviews</a></li>
				</ul>
			</li>

			<!-- Travel & Expenses -->
			<li><a href="#" onclick="toggleDropdown(event, 'travel-dropdown')">Travel and Expenses</a>
				<ul id="travel-dropdown" class="dropdown">
					<li><a href="#">Approve/reject travel requests</a></li>
					</ul>
			</li>

			<!-- Asset Management-->
			<li><a href="#" onclick="toggleDropdown(event , 'Asset-dropdown')">Asset Management</a>
				<ul id= "Asset-dropdown" class="dropdown">
					<li><a href="#">Assign company assets to employees</a></li>
					<li><a href="#">Track asset usage and maintenance</a></li>
				</ul>
			</li>
                                   <!-- Reports & Analytics -->
			<li><a href="#" onclick="toggleDropdown(event , 'Help-dropdown')">Reports & Analytics</a>
				<ul id= "Help-dropdown" class="dropdown">
					<li><a href="#">Generate reports of an employee</a></li>
					<li><a href="#">View department-wise performance metrics</a></li>
				</ul>
			</li>
                                  <!-- Manage Admins -->
			<li><a href="#" onclick="toggleDropdown(event , 'role-dropdown')">Admin Management</a>
				<ul id= "role-dropdown" class="dropdown">
					<li><a href="#">Update roles</a></li>
					<li><a href="#">Add or remove admins</a></li>
				</ul>
			</li>
                                 <!-- Audits -->
			<li><a href="#" onclick="toggleDropdown(event , 'audit-dropdown')">Audits</a>
				<ul id= "audit-dropdown" class="dropdown">
					<li><a href="#">Track audit logs</a></li>
				</ul>
			</li>


		 </ul>	
	  </div>
	 
  <!-- Content Area -->
<div class='content' id='content-area'>
    <h2>Welcome, <?php 
        if(isset($_SESSION['first_name']) && isset($_SESSION['last_name'])) {
            echo htmlspecialchars($_SESSION['first_name']) . ' ' . 
                 htmlspecialchars($_SESSION['last_name']);
        } else {
            echo htmlspecialchars($_SESSION['user_email']);
        }
    ?></h2>
    <p>Select an option from the menu on the left to get started.</p>
</div>
   </div>
   </body>
   </html>
