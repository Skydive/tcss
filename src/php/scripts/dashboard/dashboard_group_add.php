<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/group/group.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];


$display_name = $inputs['display_name'];
$name = $inputs['name'];
$access_level = $inputs['access_level_unspecified'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	SKYException::CheckNULL($display_name, "dashboard", "display_name_unspecified");
	SKYException::CheckNULL($name, "dashboard", "name_unspecified");
	SKYException::CheckNULL($access_level, "dashboard", "access_level_unspecified");

	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();

	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);
	$user_id = $token_data['user_id'];
	

	if(!(Modify::ACCESS_LEVEL_MIN <= $access_level && $access_level <= Modify::ACCESS_LEVEL_MAX) {
		SKYException::Send([
			'type' => 'access',
			'error' => 'unauthorised'
		]);
	}

	// Firstly - get access levels
	$query = "SELECT 
		b.group_id, b.access_level
	FROM users a
	INNER JOIN groups b ON a.group_id = b.group_id
	WHERE a.user_id = :user_id LIMIT 1";

	$stmt = $db->prepare($query);

	$result = $stmt->execute([
		'user_id' => $user_id
	]);
	$self = $stmt->fetch();


	if($self === null) {
		SKYException::Send([
			'type' => 'user',
			'error' => 'group_invalid'
		]);
	}
	if($self['access_level'] >= $access_level) {
		SKYException::Send([
			'type' => 'access',
			'error' => 'unauthorised'
		]);
	}

	// TODO: Add duplicate check based on 'name'
	$group = Group::Create([
		'db' => $db,
		'name' => $name,
		'display_name' => $display_name,
		'access_level' => $access_level
	]);
	Output::SetNotify('status', 'success');
	Output::SetNotify('group_id', $group['group_id']);


	$db->commit();

} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
