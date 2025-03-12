<?php
function authenticateUser($con, $email, $role) {
    $stmt = $con->prepare("CALL sp_authenticate_user(:email, :role, @user_id, @success)");
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':role', $role);
    $stmt->execute();
    $stmt = $con->query("SELECT @user_id AS user_id, @success AS success");
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createUser($con, $first_name, $last_name, $email, $password, $role, $department_id, $hr_id) {
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $con->prepare("CALL sp_create_user(:first_name, :last_name, :email, :password, :role, :department_id, :hr_id, @success, @message)");
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':last_name', $last_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':department_id', $department_id, PDO::PARAM_INT);
    $stmt->bindParam(':hr_id', $hr_id, PDO::PARAM_INT);
    $stmt->execute();
    $stmt = $con->query("SELECT @success AS success, @message AS message");
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>