<?php
$passwords = ['John@123', 'Jane@123', 'Alice@123', 'Bob@123', 'Eve@123'];
foreach ($passwords as $pwd) {
    echo "'$pwd' => '" . password_hash($pwd, PASSWORD_DEFAULT) . "',\n";
    echo "\n";
}
?>