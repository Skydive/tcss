<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/group/group.php");

// TODO: casebash test
$session_token = (string)$_COOKIE['session_token'];
// TODO: arrayify
$name = $inputs['name']; // TODO: FORMAT (lowercase, no spaces), REGEX
$display_name = $inputs['display_name'];
$access_level = $inputs['access_level'];
$group_id = $inputs['group_id'];
$subaction = $inputs['subaction'];

$BOUNDING_RANGE = [0, 100];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");

	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);
	$user_id = $token_data['user_id'];


	// Add GROUP IF
	// 1. Group access level in bounding range
	// 2. Group access level > Self access level
	// 3. Group 'name' doesn't already exist
	if(!($BOUNDING_RANGE[0] < $access_level && $access_level <= $BOUNDING_RANGE[1])) {
		SKYException::Send([
			'type' => 'access',
			'error' => 'unauthorised'
		]);
	}

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

	switch($subaction) {
	case 'edit':
		$arr = ['name', 'display_name', 'access_level'];
		$query_set = [];
		array_walk($arr, function($k) {
			if($inputs[$k]) {
				array_push("$k=:$k", $query_set);
			}
		});
		$query_set = implode(',', $query_set);
		$query = "UPDATE groups SET $query_set WHERE group_id=:group_id";
		$stmt->execute($query);
		break;
	case 'create':
		$group = Group::Query([
			'db' => $db,
			'name' => $name,
			'limit' => 1
		]);
		if($group !== null) {
			SKYException::Send([
				'type' => 'group',
				'error' => 'exists'
			]);
		}
		$ng = Group::Create([
			'db' => $db,
			'name' => $name,
			'display_name' => $display_name,
			'access_level' => $access_level
		]);
		Output::SetNotify('group_id', $ng['group_id']);
		break;
	case 'delete':
		$group = Group::Query([
			'db' => $db,
			'group_id' => $group_id,
			'limit' => 1
		]);
		if($group === null) {
			SKYException::Send([
				'type' => 'group',
				'error' => 'missing'
			]);
			$query = "DELETE FROM groups WHERE group_id=:group_id LIMIT 1";
			$stmt = $db->prepare($query);

			$result = $stmt->execute([
				'group_id' => $user_id
			]);
		}
		
		break;
	}
	
	$db->commit();
	Output::SetNotify('status', 'success');
	
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
