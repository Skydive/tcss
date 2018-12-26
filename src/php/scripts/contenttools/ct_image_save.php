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
$upload_dir = $GLOBALS['cfg']['upload_dir'];
$webroot = $GLOBALS['cfg']['web_root'];

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
			'type' => 'ct',
			'error' => 'access_denied'
		]);
	}

	if(!array_key_exists('image', $_FILES)) {
		SKYException::Send([
			'type' => 'ct',
			'error' => 'incorrect_upload_name'
		]);
	}
	if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
		SKYException::Send([
			'type' => 'ct',
			'error' => $_FILES['file']['error']

		]);
	}
	if($_FILES['image']['size'] > 2*1000*1000) {
		SKYException::Send([
			'type' => 'ct',
			'error' => 'image_size_invalid'
		]);
	}

	$finfo = new finfo(FILEINFO_MIME_TYPE);
	if (false === $ext = array_search(
		$finfo->file($_FILES['image']['tmp_name']), [
			'jpg' => 'image/jpeg',
			'png' => 'image/png',
			'gif' => 'image/gif',
			'svg' => 'image/svg+xml',
			'bmp' => 'image/bmp'

        ], true)) {
        SKYException::Send([
			'type' => 'ct',
			'error' => 'image_mime_type_invalid'
		]);
    }

    $hash = hash_file('md5', $_FILES['image']['tmp_name']);
    $out_dir = "$upload_dir/$hash.$ext";
	if(!move_uploaded_file($_FILES['image']['tmp_name'], $out_dir)) {
		SKYException::Send([
			'type' => 'ct',
			'error' => 'image_move_failed'
		]);
	}


	Output::SetNotify('type', 'success');
	Output::SetNotify('size', getimagesize($out_dir));
	Output::SetNotify('url', $GLOBALS['cfg']['upload_dir_rel']."/$hash.$ext");

} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>