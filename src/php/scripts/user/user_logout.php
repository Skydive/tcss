<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

$session_token = (string)$_COOKIE['session_token'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
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

	$db->commit();
	
	Output::SetNotify("type", "success");
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
