<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");
require_once("lib/blk/blk_ref.php");

$blk_id = $GLOBALS['cfg']['blk']['genesis']['blk_id'];
$metadata = $$GLOBALS['cfg']['blk']['genesis']['metadata'];
$content = $GLOBALS['cfg']['blk']['genesis']['content'];


try {
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	$db->beginTransaction();
	
	$blk = Blk::FetchBlkFull([
		'db' => $db,
		'blk_id' => $blk_id
	]);
	if(!$blk) {
		$metadata = array_merge((array)$default_metadata, [
			'owner_id' => 0,
			'owner_username' => 'universe',
			'owner_display_name' => 'Universe',
			'owner_group_name' => 'universe',
			'owner_last_edit_date' => time()
		]);
		$blk = Blk::Create([
			'db' => $db,
			'blk_id' => $blk_id,
			'metadata' => json_encode($metadata)
		]);
		$blk = Blk::FetchBlkFull([
			'db' => $db,
			'blk_id' => $blk['blk_id']
		]);
	}
	SKYException::CheckNULL($blk, 'singleton', 'blk_id_missing');

	error_log(json_encode($blk));
	$refs = $blk['blk_refs'];
	foreach($content as $refname => $refdata) {
		if(!array_key_exists($refname, $refs)) {
			error_log(json_encode($refname));

			Blk_Ref::Create([
				'db' => $db,
				'blk_id' => $blk['blk_id'],
				'name' => $refname,
				'data' => $refdata
			]);
		}
	}
	$blk = Blk::FetchBlkFull([
		'db' => $db,
		'blk_id' => $blk['blk_id']
	]);
	
	$cur_metadata = json_decode($blk['metadata'], true);
	$merged_metadata = array_merge((array)$cur_metadata, [
		'handler' => 'genesis'
	]);
	Blk::Update([
		'db' => $db,
		'blk_id' => $blk['blk_id'],
		'metadata' => json_encode($merged_metadata)
	]);
	$blk = Blk::FetchBlkFull([
		'db' => $db,
		'blk_id' => $blk['blk_id']
	]);

	Output::SetNotify('status', 'success');
	Output::SetNotify('blk', json_encode($blk));
	
	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>