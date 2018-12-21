<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/framework/group/group.php");

require_once("lib/blk/blk.php");
require_once("lib/blk/feed/feed.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];

$feed_type = $inputs['feed_type'];
$feed_date = (int)$inputs['feed_date'];

$content = json_decode($inputs['content']);

try {
	SKYException::CheckNULL($feed_date, 'feed', 'feed_date_missing');
	SKYException::CheckNULL($feed_type, 'feed', 'feed_type_missing');

	if(!in_array($feed_type, $GLOBALS['feed']['valid'])) {
		SKYException::Send([
			'type' => 'feed',
			'error' => 'feed_type_invalid'
		]);
	}

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
			'type' => 'feed',
			'error' => 'access_denied'
		]);
	}

	$blk = Feed::Create([
		'db' => $db,
		'feed_type' => $feed_type,
		'feed_date' => $feed_date,
		'user_id' => $user_id
	]);
	if($content) {
		foreach($content as $refname => $refdata) {
			Blk_Ref::Create([
				'db' => $db,
				'blk_id' => $blk['blk_id'],
				'name' => $refname,
				'data' => $refdata
			]);
		}

		$refresh_result = Blk::RefreshHash([
			'db' => $db,
			'blk_id' => $blk['blk_id']
		]);
	}
	$db->commit();

	Output::SetNotify("type", "success");
	Output::SetNotify("blk_id", $blk['blk_id']);

} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>