<?php
session_start();
if (!isset($_SESSION['user_email'])) {
    header("Location: employee_login.php");
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
        background-color: #333;
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
            background-color: #333;
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
    </style>
    <script>
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
	<h1>Employee Dashboard</h1>	
	<div class="logout">	
		<a href="logout.php">Logout</a>	
	</div>	
</header>	

<div class="dashboard-container">	
	<!-- Sidebar -->	
	<div class="sidebar">	
		<ul>	
			<!-- Profile Management -->	
			<li><a href="#" onclick="toggleDropdown(event, 'profile-dropdown')">Profile Management</a>	
				<ul id="profile-dropdown" class="dropdown">	
					<li><a href="#">View and update personal details</a></li>	
					<li><a href="#">Change password</a></li>	
				</ul>	
			</li>	

			<!-- Attendance & Leaves -->	
			<li><a href="#" onclick="toggleDropdown(event, 'attendance-dropdown')">Attendance & Leaves</a>	
				<ul id="attendance-dropdown" class="dropdown">	
					<li><a href="#">Mark daily attendance</a></li>	
					<li><a href="#">View attendance history</a></li>	
					<li><a href="#">Apply for leave</a></li>	
					<li><a href="#">Track leave requests</a></li>	
				</ul>	
			</li>	

			<!-- Payroll & Salary -->	
			<li><a href="#" onclick="toggleDropdown(event, 'payroll-dropdown')">Payroll & Salary</a>	
				<ul id="payroll-dropdown" class="dropdown">	
					<li><a href="#">View salary details and payslips</a></li>	
					<li><a href="#">Track salary changes</a></li>	
				</ul>	
			</li>

		           <!-- Projects & Tasks -->
			<li><a href="#" onclick="toggleDropdown(event,'project-dropdown')">Projects & Tasks</a>
				<ul id="project-dropdown" class="dropdown">
					<li><a href="#">View assigned projects and roles</a></li>
					<li><a href="#">Update project completion status</a></li>
				</ul>
			</li>

			<!-- Training & Performance -->
			<li><a href="#" onclick="toggleDropdown(event, 'training-dropdown')">Training & Performance</a>
				<ul id="training-dropdown" class="dropdown">
					<li><a href="#">Enroll in training programs</a></li>
					<li><a href="#">Track training completion status</a></li>
					<li><a href="#">View performance review scores and feedback</a></li>
				</ul>
			</li>

			<!-- Travel & Expenses -->
			<li><a href="#" onclick="toggleDropdown(event, 'travel-dropdown')">Travel & Expenses</a>
				<ul id="travel-dropdown" class="dropdown">
					<li><a href="#">Submit travel requests</a></li>
					<li><a href="#">Upload expense reports and receipts</a></li>
					<li><a href="#">Track approval status of travel and expense requests</a></li>
				</ul>
			</li>

			<!-- Feedback -->
			<li><a href="#" onclick="toggleDropdown(event , 'feedback-dropdown')">Feedback & Exit Interviews</a>
				<ul id= "feedback-dropdown" class="dropdown">
					<li><a href="#">Submit feedback about company policies or issues</a></li>
					<li><a href="#">View exit interview details (if applicable)</a></li>
				</ul>
			</li>

		 </ul>	
	  </div>
	 
   <!-- Content Area -->
   <div class='content' id='content-area'>
	   <h2><?php echo htmlspecialchars($_SESSION['user_email']); ?></h2>
	   <p>Select an option from the menu on the left to get started.</p>
   </div>
   </div>
   </body>
   </html>
