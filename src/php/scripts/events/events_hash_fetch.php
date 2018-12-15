<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");

$index = (int)$inputs['index'];
$count = (int)$inputs['count'];
$date_start = (int)$inputs['date_start'];
$date_end = (int)$inputs['date_end'];

try {	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$query = "SELECT 
		a.event_id, a.event_date,
		b.blk_id, b.blk_hash FROM events a
	INNER JOIN content_blk b ON a.blk_id = b.blk_id
	WHERE a.event_date >= :date_start 
	AND a.event_date <= :date_end ORDER BY a.event_date DESC LIMIT $count OFFSET $index";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'date_start' => date("Y-m-d G:i:s", $date_start),
		'date_end' => date("Y-m-d G:i:s", $date_end)
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$rows = $stmt->fetchAll();

	Output::SetNotify('status', 'success');
	Output::SetNotify('event_hashes', $rows);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>