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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        header h1 {
            margin: 0;
        }
        nav {
            display: flex;
            gap: 2em;
        }
        nav ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }
        nav ul li {
            position: relative;
            display: inline-block;
        }
        nav ul li a {
            color: white;
            text-decoration: none;
            padding: 0.5em 1em;
            display: block;
        }
        nav ul li:hover > a {
            background-color: #575757;
        }
        nav ul li ul {
            display: none;
            position: absolute;
            background-color: #333;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 5px;
        }
        nav ul li:hover ul {
            display: block;
        }
        nav ul li ul li {
            width: 200px; /* Set dropdown width */
        }
        nav ul li ul li a {
            padding: 0.5em 1em;
        }
        nav ul li ul li a:hover {
            background-color: #575757;
        }
        .logout {
            margin-right: 1em;
        }
        .logout a {
            color: white;
            text-decoration: none;
        }
        .logout a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
<header>
    <nav>
        <!-- Profile Management -->
        <ul>
            <li><a href="#">Manage Users</a>
            </li>

            <li><a href="#">Attendance Records</a>
                            </li>

           <li><a href="#">Generate Reports</a>
                            </li>

            <!-- Projects & Tasks -->
            <li><a href="#">Assign Project</a>
                        </li>

        
            <li><a href="#">Employee requests</a>
                            </li>

            <li><a href="#">View Departments</a>
                          </li>

        </ul>

    </nav>

    <!-- Logout -->
    <div class="logout">
        <a href="logout.php">Logout</a>
    </div>

</header>

<main style="padding: 2em; text-align:center;">
    <!-- Welcome Message -->
    <?php echo "<h2>Welcome, " . htmlspecialchars($_SESSION['user_email']) . "</h2>"; ?>
    <!-- Add any additional content here -->
    <p>Select an option from the menu above to get started.</p> 
</main>

</body>
</html> 

