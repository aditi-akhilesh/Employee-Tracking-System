
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Employee Tracking System</title>
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
            text-align: center;
            padding: 1em;
        }
        .container {
            max-width: 400px;
            margin: 2em auto;
            background-color: white;
            padding: 2em;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        h2 {
            text-align: center;
            margin-top: 0;
            color: #333;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        label {
            margin-bottom: 0.5em;
        }
        input[type="email"], input[type="password"] {
            padding: 0.5em;
            margin-bottom: 1em;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        input[type="submit"] {
            background-color: #4CAF50;
            color: white;
            padding: 0.7em;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #45a049;
        }
        .employee-link {
            text-align: center;
            margin-top: 1em;
        }
        .employee-link a {
            color: #333;
            text-decoration: none;
        }
        .employee-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>Employee Tracking System</h1>
    </header>
        <br><h3 style="text-align: center; color: #333;">Welcome to Employee Tracking Portal!</h3><br>
    <div class="container">
        <h2>Admin Login</h2>
        <form action="admin_authenticate.php" method="post">
            <label for="admin_email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="admin_password">Password:</label>
            <input type="password" id="password" name="password" required>
            
            <input type="submit" value="Login">
            <?php
session_start();
if (isset($_SESSION['error'])) {
    echo "<p style='color:red;'>" . $_SESSION['error'] . "</p>";
    unset($_SESSION['error']); // Clear the error after displaying it
}
?>

        </form>
        <div class="employee-link">
            <p>Are you an employee? <a href="employee_login.php" style="color: #007bff;">Login here</a></p>
        </div>
    </div>
</body>
</html>
