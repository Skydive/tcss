<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$session_token = (string)$_COOKIE['session_token'];
$blk_id = (int)$inputs['blk_id'];

try {
	SKYException::CheckNULL($blk_id, "blk", "blk_id_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();
	
	$blk_refs = Content_Blk::Fetch_Blk_Refs_From_Blk([
		'db' => $db,
		'blk_id' => $blk_id
	]);

	
	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_id);
	Output::SetNotify('blk_refs', $blk_refs);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'access':
		case 'blk':
		case 'dashboard':
		case 'session':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>