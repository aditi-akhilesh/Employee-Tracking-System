<?php
/**
 * This file defines PDO database package. This file is included in any files that needs database connection
 * http://wiki.hashphp.org/PDO_Tutorial_for_MySQL_Developers
 * http://php.net/manual/en/pdostatement.fetch.php
  */
ini_set('display_errors', 1);
error_reporting(E_ALL);

/*** mysql hostname ***/
$hostname = 'localhost';

/*** your mysql username ***/
$username = 'amriprak';

/*** your mysql password ***/
$password = 'marathoner dispirit lamely supping';

/*** replace xxx_db with your db name ***/
try {
    	$con = new PDO("mysql:host=$hostname;dbname=amriprak_db", $username, $password);
    	/*** echo a message saying we have connected ***/
    	echo 'Connected to database';
    }
catch(PDOException $e)
    {
    	echo $e->getMessage();
	echo "Something is wrong. Please try again later or contact the system administrator. ";

    }

?>
