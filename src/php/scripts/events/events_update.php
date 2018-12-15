<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/framework/group/group.php");

require_once("lib/blk/blk.php");
require_once("lib/events/events.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];


$event_id = (int)$inputs['event_id'];
$event_date = (int)$inputs['event_date'];


$content = json_decode((string)$inputs['content']);

try {
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);
	$user_id = $token_data['user_id'];

	$user_group = Group::Query([
		"db" => $db,
		"group_id" => $token_data['group_id'],
		"limit" => 1
	]);
	
	if($user_group['access_level'] > EAccessLevel::COMMITTEE) {
		SKYException::Send([
			'type' => 'events',
			'error' => 'access_denied'
		]);
	}


	$query = "SELECT e.blk_id, g.access_level FROM events e
	INNER JOIN users u ON e.user_owner = u.user_id
	INNER JOIN groups g ON u.group_id = g.group_id
	WHERE e.event_id = :event_id LIMIT 1";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'event_id' => $event_id
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	$event_info = $stmt->fetch();

	if(!($user_group['access_level'] <= $event_info['access_level']
	|| $user_group['access_level'] == EAccessLevel::PRESIDENT)) {
		SKYException::Send([
			'type' => 'events',
			'error' => 'access_denied'
		]);
	}

	if($event_date) {
		$event = Events::Update([
			'db' => $db,
			'event_id' => $event_id,
			'event_date' => date("Y-m-d G:i:s", $event_date)
		]);
	}

	$query = "SELECT r.blk_ref_id, r.blk_ref_name FROM content_blk b
	INNER JOIN content_blk_ref r ON b.blk_id = r.blk_id
	INNER JOIN events e ON b.blk_id = e.blk_id
	WHERE e.event_id = :event_id";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'event_id' => $event_id
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	$q_rows = $stmt->fetchAll();
	$blk_refs = [];
	foreach($q_rows as $r) {
		$blk_refs[$r['blk_ref_name']] = $r;
	}

	foreach($content as $refname => $refdata) {
		if(array_key_exists($refname, $blk_refs)) {
			Content_Blk_Ref::Update([
				'db' => $db,
				'blk_ref_id' => $blk_refs[$refname]['blk_ref_id'],
				'data' => $refdata
			]);
		} else {
			Content_Blk_Ref::Create([
				'db' => $db,
				'blk_id' => $event_info['blk_id'],
				'blk_ref_name' => $refname,
				'data' => $refdata
			]);
		}
	}
	$refresh_result = Content_Blk::RefreshHash([
		'db' => $db,
		'blk_id' => $event_info['blk_id']
	]);

	$db->commit();
	
	Output::SetNotify("type", "success");
	Output::SetNotify("event_id", $event_id);
	Output::SetNotify("blk_id", $event_info['blk_id']);
	Output::SetNotify("blk_hash_old", $refresh_result['blk_hash']);
	Output::SetNotify("blk_hash", $refresh_result['blk_hash']);
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>