<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");

$event_ids = json_decode($inputs['event_ids']);
try {
	//TODO: exception
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$events = [];

	$query = "SELECT
		b.blk_id, b.blk_hash,
		c.blk_ref_name, c.data,
		a.event_id, a.event_date FROM events a
	INNER JOIN content_blk b ON a.blk_id = b.blk_id
	INNER JOIN content_blk_ref c ON a.blk_id = c.blk_id
	WHERE a.event_id = :event_id";
	foreach($event_ids as $event_id) {
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'event_id' => $event_id
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
		$rows = $stmt->fetchAll();
		$event = [];
		if(!$rows) {
			$event['event_id'] = $event_id;
			$event['blk'] = null;
			$events[] = $event;
			continue;
		}
		$event['blk'] = [];
		$event['blk']['blk_refs'] = [];
		$first = true;
		foreach($rows as $row) {
			if($first) {
				$first = false;
				$event['event_id'] = $row['event_id'];
				$event['event_date'] = $row['event_date'];

				$event['blk']['blk_id'] = $row['blk_id'];
				$event['blk']['blk_hash'] = $row['blk_hash'];
			}
			$event['blk']['blk_refs'][$row['blk_ref_name']] = $row['data'];
		}
		$events[] = $event;
	}
	Output::SetNotify('status', 'success');
	Output::SetNotify('events', $events);
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>