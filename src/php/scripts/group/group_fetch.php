<?php
// TODO: Code a BIG PHP rainbow inner join user_verify function -> perhaps precess_verify for this purpose
// Since this is the script dir, maybe make user_verify more powerful?
// Code a BIG rainbow query TRIPLE inner join function for generalised user queries -- PrecessUser class, perhaps?
// Consider using an inheritance model even?
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/framework/group/group.php");

$session_token = (string)$_COOKIE['session_token'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$user = User::Query([
		"db" => $db,
		"user_id" => $token_data['user_id'],
		"requests" => ['user_id', 'group_id'],
		"limit" => 1
	]);
	if($user === null) {
		SKYException::Send([
			'type' => 'user',
			'error' => 'unmatched_user_id'
		]);
	}

	$group = Group::Query([
		"db" => $db,
		"group_id" => $user['group_id'],
		"limit" => 1
	]);
	if($group === null) {
		SKYException::Send([
			'type' => 'group',
			'error' => 'crsid_unknown'
		]);
	}

	Output::SetNotify("type", "success");
	foreach($group as $k => $v) {
		Output::SetNotify($k, $v);
	}
	foreach($user as $k => $v) {
		Output::SetNotify($k, $v);
	}
} catch (SKYException $e) {
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'session':
		case 'group':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
