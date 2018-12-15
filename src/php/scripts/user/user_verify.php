<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");

$session_token = (string)$_COOKIE['session_token'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	SKYException::CheckNULL($db, "db", "null");
	
	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$user = User::Query([
		"db" => $db,
		"user_id" => $token_data['user_id'],
		"requests" => ['user_id', 'username'],
		"limit" => 1
	]);
	if($user === null) {
		SKYException::Send([
			'type' => 'user',
			'error' => 'unmatched_user_id'
		]);
	}
	
	Output::SetNotify("type", "success");
	Output::SetNotify("username", $user['username']);
	Output::SetNotify("user_id", $user['user_id']);
} catch (SKYException $e) {
	SKYException::Notify();
}
?>
