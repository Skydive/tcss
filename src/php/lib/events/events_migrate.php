<?php
chdir("/www/build/php");
require_once("config.php");
require_once("lib/core/database.php");
require_once("lib/core/security.php");

require_once("lib/blk/blk.php");
require_once("lib/blk/blk_ref.php");

$evs = json_decode(file_get_contents('lib/events/old_events.json'), true);
$db = Database::Connect($GLOBALS['cfg']['project_name']);
foreach($evs as $ev) {
	$db->beginTransaction();
    
	$header = "<h1>".$ev['title']."</h1>\n"."<h2>".$ev['speaker']."</h2>";
	$loc = "<h2>".$ev['loc']."</h2>";
	$datetime = $ev['datetime'];
	$content = [
		'datetime' => $datetime,
		'location' => $loc,
		'header' => $header,
		'body' => "<p>".$ev['content']."</p>"
	];

	$blk = Blk::Create([
		'db' => $db,
		'metadata' => json_encode([
			'handler' => 'events',
			'feed_date' => $datetime,
			'owner_id' => 2101003031348539,
			'owner_username' => 'rk582',
			'owner_display_name' => 'Ruslan Kotlyarov',
			'owner_group_name' => 'President',
			'owner_last_edit_date' => time()
		])
	]);
	foreach($content as $refname => $refdata) {
		Blk_Ref::Create([
			'db' => $db,
			'blk_id' => $blk['blk_id'],
			'name' => $refname,
			'data' => $refdata
		]);
	}

	$refresh_result = Blk::RefreshHash([
		'db' => $db,
		'blk_id' => $blk['blk_id']
	]);

	/*$ev_date = date("Y-m-d G:i:s", $datetime);
	$event = Events::Create([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'user_owner' => 4069529068622132,
		'event_date' => $ev_date
	]);*/

    $db->commit();
}
?>