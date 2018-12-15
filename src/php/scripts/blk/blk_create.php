<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");

try {
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();


	$row = Content_Blk::Create([
		'db' => $db
	]);
	
	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $row['blk_id']);


	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
