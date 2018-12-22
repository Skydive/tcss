<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");

$feed_type = $inputs['feed_type'];
$index = (int)$inputs['index'];
$count = (int)$inputs['count'];
$date_start = (int)$inputs['date_start'];
$date_end = (int)$inputs['date_end'];

try {
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();

	$query = "SELECT
		blk_id, hash, metadata
	FROM blk
	WHERE (metadata ->> 'handler') = :handler
	AND (metadata ->> 'feed_date')::bigint > :date_start
	AND	(metadata ->> 'feed_date')::bigint < :date_end
	AND active = TRUE";

	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'handler' => $feed_type,
		'date_start' => $date_start,
		'date_end' => $date_end
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	$hashes = $stmt->fetchAll();
	
	Output::SetNotify('status', 'success');
	Output::SetNotify('feed_hashes', $hashes);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>