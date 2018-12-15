<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/atlas/atlas.php");

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
		"requests" => ['username', 'user_id'],
		"limit" => 1
	]);
	if($user === null) {
		SKYException::Send([
			'type' => 'user',
			'error' => 'unmatched_user_id'
		]);
	}

	$atlas = Atlas::Query([
		"db" => $db,
		"crsid" => $user['username'],
		"limit" => 1
	]);
	if($atlas === null) {
		SKYException::Send([
			'type' => 'atlas',
			'error' => 'atlas_crsid_unknown'
		]);
	}

	Output::SetNotify("type", "success");
	foreach($atlas as $k => $v) {
		Output::SetNotify($k, $v);
	}
	foreach($user as $k => $v) {
		Output::SetNotify($k, $v);
	}
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
