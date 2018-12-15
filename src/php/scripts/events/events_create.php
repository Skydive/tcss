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

	$blk = Content_Blk::Create([
		'db' => $db
	]);
	
	if(!$content) {
		$content = [
			'dummy' => 'dummy'
		];
	}

	foreach($content as $refname => $refdata) {
		Content_Blk_Ref::Create([
			'db' => $db,
			'blk_id' => $blk['blk_id'],
			'blk_ref_name' => $refname,
			'data' => $refdata
		]);
	}

	$ev_date = date("Y-m-d G:i:s", $event_date);
	$event = Events::Create([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'user_owner' => $user_id,
		'event_date' => $ev_date
	]);

	$db->commit();

	Output::SetNotify("type", "success");
	Output::SetNotify("event_id", $event['event_id']);
	Output::SetNotify("blk_id", $blk['blk_id']);

} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>