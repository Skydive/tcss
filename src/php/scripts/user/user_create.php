<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/user.php");

$username = (string)$inputs['username'];
$password = (string)$inputs['password'];

try {
	SKYException::CheckNULL($username, "user", "username_unspecified");
	SKYException::CheckNULL($password, "user", "password_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$db->beginTransaction();

	User::Create([
		'db' => $db,
		'username' => $username,
		'password' => $password
	]);

	$db->commit();
	Output::SetNotify("type", "success");
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
