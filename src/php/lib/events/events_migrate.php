<?php
chdir("/www/dev.tcss.precess.io/php");
require_once("config.php");
require_once("lib/core/database.php");
require_once("lib/core/security.php");

require_once("lib/blk/blk.php");
require_once("lib/events/events.php");

$evs = json_decode(file_get_contents('lib/events/old_events.json'), true);
$db = Database::Connect($GLOBALS['cfg']['project_name']);
foreach($evs as $ev) {
	$db->beginTransaction();
    
	$header = "<h3>".$ev['title']."</h3>\n"."<h4>".$ev['speaker']."</h4>";
	$loc = "<h4>".$ev['loc']."</h4>";
	$datetime = $ev['datetime'];
	$content = [
		'datetime' => $datetime,
		'location' => $loc,
		'header' => $header,
		'body' => "<p>".$ev['content']."</p>"
	];

	$blk = Content_Blk::Create([
		'db' => $db
	]);
	foreach($content as $refname => $refdata) {
		Content_Blk_Ref::Create([
			'db' => $db,
			'blk_id' => $blk['blk_id'],
			'blk_ref_name' => $refname,
			'data' => $refdata
		]);
	}

	$ev_date = date("Y-m-d G:i:s", $datetime);
	$event = Events::Create([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'user_owner' => 4069529068622132,
		'event_date' => $ev_date
	]);

    $db->commit();
}
?>