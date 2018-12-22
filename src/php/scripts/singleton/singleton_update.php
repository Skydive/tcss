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
$metadata = json_decode($inputs['metadata']);
$content = json_decode($inputs['content']);

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
	// TODO: CHECK IF VALID FEED...
	$blk = Blk::FetchBlkFull([
		'db' => $db,
		'blk_id' => $blk_id
	]);
	if(!$blk) {
		$blk = Blk::Create([
			'db' => $db,
			'metadata' => json_encode($metadata)
		]);
		$blk = Blk::FetchBlkFull([
			'db' => $db,
			'blk_id' => $blk['blk_id']
		]);
	}
	SKYException::CheckNULL($blk, 'singleton', 'blk_id_missing');

	$refs = $blk['blk_refs'];
	$salt = $blk['metadata'];
	if($content) { // DEAL WITH REFS
		foreach($content as $refname => $refdata) {
			if(array_key_exists($refname, $refs)) {
				Blk_Ref::Update([
					'db' => $db,
					'blk_ref_id' => $refs[$refname]['blk_ref_id'],
					'data' => $refdata
				]);
			} else {
				Blk_Ref::Create([
					'db' => $db,
					'blk_id' => $blk['blk_id'],
					'name' => $refname,
					'data' => $refdata
				]);
			}
		}
	}

	if(!$metadata)$metadata = []; // GET METADATA
	$query = "SELECT
		a.user_id, a.username,
		b.display_name AS group_name, b.access_level,
		c.display_name AS display_name
	FROM users a
	INNER JOIN groups b ON a.group_id = b.group_id
	INNER JOIN atlas c ON a.username = c.crsid
	WHERE a.user_id = :user_id";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'user_id' => $user_id
	]);
	SKYException::CheckNULL($result, 'singleton', 'user_id_missing');
	$row = $stmt->fetch();
	if($row) {
		$metadata = array_merge((array)$metadata, [
			'owner_id' => $row['user_id'],
			'owner_username' => $row['username'],
			'owner_display_name' => $row['display_name'],
			'owner_group_name' => $row['group_name'],
			'owner_last_edit_date' => time()
		]);
	}
	// MERGE METADATA
	$cur_metadata = json_decode($blk['metadata'], true);
	$merged_metadata = array_merge((array)$cur_metadata, (array)$metadata);
	Blk::Update([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'metadata' => json_encode($merged_metadata)
	]);

	$salt = json_encode($merged_metadata); // Fetch again if metadata changes...
	$refresh_result = Blk::RefreshHash([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'salt' => $salt
	]);

	$updated_blk = Blk::FetchBlkFull([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
	]);

	$db->commit();

	Output::SetNotify("type", "success");
	Output::SetNotify("blk_new", $updated_blk);
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>