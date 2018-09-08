<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");

$username = (string)$inputs['username'];
$password = (string)$inputs['password'];


try {
	SKYException::CheckNULL($username, "user", "username_unspecified");
	SKYException::CheckNULL($password, "user", "password_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();
	
	$data = User::CredentialsValidate([
		'db' => $db,
		'username' => $username,
		'password' => $password
	]);

	$login_result = Session::Create([
		'db' => $db,
		'user_id' => $data['user_id'],
		'user_agent' => $_SERVER['HTTP_USER_AGENT'] ? $_SERVER['HTTP_USER_AGENT'] : "default-agent"
	]);

	$db->commit();

	Output::SetNotify("type", "success");
	Output::SetNotify("session_token", $login_result['session_token']);
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
}
?>
