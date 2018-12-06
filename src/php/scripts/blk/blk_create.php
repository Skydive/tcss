<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$session_token = (string)$_COOKIE['session_token'];
$friendly_name = $inputs['friendly_name'] ? $inputs['friendly_name'] : "Dummy";
$access_level = array_key_exists('access_level', $inputs) ? (int)$inputs['access_level'] : 0;
$metadata = $inputs['metadata'] ? (string)$inputs['metadata'] : "{}";

try {
	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();

	$blk_id = Security::GenerateUniqueInteger();
	$time = time();
	$blk_hash = hash("crc32b", "$time");
	
	$metadata = json_decode($metadata);
	$metadata->creation_date = time();
	$metadata->friendly_name = $friendly_name;
	$metadata->access_level = $access_level;
	$metadata = json_encode($metadata);

	$query = "INSERT INTO content_blk(
		blk_id,
		blk_hash,
		metadata
	) VALUES (
		:blk_id,
		:blk_hash,
		:metadata
	)";
	$stmt = $db->prepare($query);
	$stmt->execute([
		'blk_id' => $blk_id,
		'blk_hash' => $blk_hash,
		'metadata' => $metadata
	]);

	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_id);


	$db->commit();
} catch (SKYException $e) {
	if($db) $db->rollback();
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'dashboard':
		case 'session':
		case 'access':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
