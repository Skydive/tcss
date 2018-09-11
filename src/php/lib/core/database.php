<?php
require_once("lib/core/exception.php");
class Database {
	public static function Connect($database) {
		$host = $GLOBALS['databases'][$database]['host'];
		$user = $GLOBALS['databases'][$database]['username'];
		$pass = $GLOBALS['databases'][$database]['password'];
		$charset = 'utf8mb4';
		$dsn = $GLOBALS['dsn'];
		$dsn = "$dsn:host=$host;dbname=$database;charset=$charset";
		$opt = [
			PDO::ATTR_ERRMODE			 => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
			PDO::ATTR_EMULATE_PREPARES	 => false,
			PDO::ATTR_AUTOCOMMIT		 => false
		];
		try {
			$db = new PDO($dsn, $user, $pass, $opt);
		} catch (PDOException $e) {
			SKYException::Send(['type' => 'db', 'error' => "connection_failed_".$e->getMessage()]);
		}
		SKYException::CheckNULL($db, "db", "null");
		return $db;
	}
}
?>
