<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$blk_ids = json_decode($inputs['blk_ids']);

try {
	SKYException::CheckNULL($blk_ids, "blk", "blk_ids_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$blks = [];
	foreach($blk_ids as $blk_id) {
		$blk = Blk::FetchBlkFull([
			'db' => $db,
			'blk_id' => $blk_id
		]);
		if(!$blk)continue;
		$blks[] = $blk;
	}

	Output::SetNotify('status', 'success');
	Output::SetNotify('blks', json_encode($blks));
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>