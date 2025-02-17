


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Performance Tracking System</title>
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
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
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
        .admin-link {
            text-align: center;
            margin-top: 1em;
        }
        .admin-link a {
            color: #333;
            text-decoration: none;
        }
        .admin-link a:hover {
            text-decoration: underline;
        }
           </style>
</head>
<body>
    <header>
          
        <h1>Employee Performance Tracking System</h1>
    </header>
    <div class="container">
        <h2>Employee Login</h2>
            <form action="employee_authenticate.php" method="post">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            
            <input type="submit" value="Login">
        </form>
        <div class="admin-link">
            <p>Are you an admin? <a href="admin_login.php">Login here</a></p>
        </div>
    </div>
</body>
</html>
