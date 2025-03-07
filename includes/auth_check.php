<?php
session_start();
if (!isset($_SESSION['user_email'])) {
    header("Location: ../pages/login.php");
    exit();
}