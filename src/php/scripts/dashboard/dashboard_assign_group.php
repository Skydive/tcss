<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/group/group.php");

$session_token = (string)$_COOKIE['session_token'];
$other_user_id = $inputs['user_id'];
$group_id = $inputs['group_id'];

$BOUNDING_RANGE = [0, 100];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	SKYException::CheckNULL($other_user_id, "dashboard", "user_id_unspecified");
	SKYException::CheckNULL($group_id, "dashboard", "group_id_unspecified");


	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();

	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);
	$user_id = $token_data['user_id'];
	if($user_id == $other_user_id) {
		SKYException::Send([
			'type' => 'access',
			'error' => 'self_modify'
		]);
	}

	// Firstly - get access levels
	$group = Group::Query([
		"db" => $db,
		"group_id" => $group_id,
		"limit" => 1
	]);
	if($group === null) {
		SKYException::Send([
			'type' => 'group',
			'error' => 'invalid'
		]);
	}
	if(!($BOUNDING_RANGE[0] < $group['access_level'] && $group['access_level'] <= $BOUNDING_RANGE[1])) {
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
		'user_id' => $other_user_id
	]);
	$other = $stmt->fetch();

	$result = $stmt->execute([
		'user_id' => $user_id
	]);
	$self = $stmt->fetch();

	// TODO: fix president SELF assignment - should be possible
	if($self['access_level'] >= $other['access_level'] || $self['access_level'] >= $group['access_level']) {
		SKYException::Send([
			'type' => 'access',
			'error' => 'unauthorised'
		]);
	}


	$query = "UPDATE users SET group_id=:group_id WHERE user_id=:user_id";

	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'group_id' => $group_id,
		'user_id' => $other_user_id
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$db->commit();

	Output::SetNotify('status', 'success');
} catch (SKYException $e) {
	if($db) $db->rollback();
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'dashboard':
		case 'session':
		case 'access':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
