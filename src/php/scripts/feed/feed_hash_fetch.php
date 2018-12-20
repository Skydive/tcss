<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/feed/feed.php");

$feed_type = $inputs['feed_type'];
$index = (int)$inputs['index'];
$count = (int)$inputs['count'];
$date_start = (int)$inputs['date_start'];
$date_end = (int)$inputs['date_end'];

try {
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$hashes = Feed::FetchHashDateRange([
		'db' => $db,
		'feed_type' => $feed_type,
		'date_start' => $date_start,
		'date_end' => $date_end
	]);
	
	Output::SetNotify('status', 'success');
	Output::SetNotify('feed_hashes', $hashes);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>