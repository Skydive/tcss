<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/framework/group/group.php");

require_once("lib/blk/blk.php");
require_once("lib/blk/blk_ref.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];

$blk_id = (int)$inputs['blk_id'];

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
			'type' => 'singleton',
			'error' => 'access_denied'
		]);
	}

	$blk = Blk::Query([
		'db' => $db,
		'blk_id' => $blk_id
	]);

	// TODO: metadata check

	$query = "UPDATE blk SET active = FALSE WHERE blk_id = :blk_id";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'blk_id' => $blk_id
	]);
	SKYException::CheckNULL($result, 'singleton', 'blk_id_missing');

	$db->commit();

	Output::SetNotify("type", "success");
	Output::SetNotify("blk_id", $blk['blk_id']);

} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>