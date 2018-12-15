<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$blk_id = (int)$inputs['blk_id'];

try {
	SKYException::CheckNULL($blk_id, "blk", "blk_id_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	
	$blk_row = Content_Blk::Query([
		'db' => $db,
		'blk_id' => $blk_id,
		'request' => ['blk_id','blk_hash']
	]);
	if(!$blk_row) {
		SKYException::Send([
			'type' => 'blk',
			'error' => 'id_missing'
		]);
	}

	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_row['blk_id']);
	Output::SetNotify('blk_hash', $blk_row['blk_hash']);
	
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>