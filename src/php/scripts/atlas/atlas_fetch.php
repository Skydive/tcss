<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/atlas/atlas.php");

$session_token = (string)$_COOKIE['session_token'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$user = User::GetByID([
		"db" => $db,
		"user_id" => $token_data['user_id']
	]);

	$atlas = Atlas::FromCRSID([
		'db' => $db,
		'crsid' => $user['username']
	]);
	Output::SetNotify("type", "success");
	Output::SetNotify("crsid", $atlas['crsid']);
	Output::SetNotify("display_name", $atlas['display_name']);
	Output::SetNotify("surname", $atlas['surname']);
	Output::SetNotify("role", $atlas['role']);
	Output::SetNotify("college", $atlas['college']);

	
	Output::SetNotify("username", $user['username']);
	Output::SetNotify("user_id", $user['user_id']);
} catch (SKYException $e) {
	if($db) $db->rollback();
	
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'session':
		case 'atlas':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
