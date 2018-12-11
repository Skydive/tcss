<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");

try {
	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();

	$blk_id = Security::GenerateUniqueInteger();
	$time = time();
	$blk_hash = hash("crc32b", "$time");
		

	$query = "INSERT INTO content_blk(
		blk_id,
		blk_hash,
		metadata
	) VALUES (
		:blk_id,
		:blk_hash
	)";
	$stmt = $db->prepare($query);
	$stmt->execute([
		'blk_id' => $blk_id,
		'blk_hash' => $blk_hash
	]);

	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_id);


	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
