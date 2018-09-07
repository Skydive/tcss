<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

$session_token = (string)$_COOKIE['session_token'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$db->beginTransaction();
	
	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$destroy_result = Session::Destroy([
		'db' => $db,
		'id' => $token_data['id']
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
		case 'session':
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
