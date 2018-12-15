<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$blk_id = (int)$inputs['blk_id'];

try {
	SKYException::CheckNULL($blk_id, "blk", "blk_id_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$blk_refs = Content_Blk::Fetch_Blk_Refs_From_Blk([
		'db' => $db,
		'blk_id' => $blk_id
	]);
	if(!$blk_refs) {
		SKYException::Send([
			'type' => 'blk',
			'error' => 'id_missing'
		]);
	}

	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_id);
	Output::SetNotify('blk_refs', $blk_refs);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>