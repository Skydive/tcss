<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/user.php");

$username = (string)$inputs['username'];
$password = (string)$inputs['password'];

try {
	SKYException::CheckNULL($username, "user", "username_unspecified");
	SKYException::CheckNULL($password, "user", "password_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$db->beginTransaction();

	User::Create([
		'db' => $db,
		'username' => $username,
		'password' => $password
	]);
	Output::SetNotify("type", "success");
} catch (SKYException $e) {
	if($db) $db->rollback();
	
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'user':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
	Output::PrintOutput();
	die();
}
$db->commit();
Output::PrintOutput();
?>
