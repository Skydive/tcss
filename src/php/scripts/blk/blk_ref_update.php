<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/blk/blk.php");


$session_token = (string)$_COOKIE['session_token'];

$data = $inputs['data'];
$blk_id = (int)$inputs['blk_id'];
$blk_ref_id = (int)$inputs['blk_ref_id'];
$blk_ref_name = $inputs['blk_ref_name'];
$metadata = $inputs['metadata'] ? (string)$inputs['metadata'] : "{}";

try {
	$db = Database::Connect($GLOBALS['project_name']);
	$db->beginTransaction();
	

	$ref = Content_Blk_Ref::Query([
		'db' => $db,
		'blk_ref_id' => $blk_ref_id,
		'requests' => ['blk_id']
	]);

	if($ref) {
		Content_Blk_Ref::Update([
			'db' => $db,
			'blk_ref_id' => $blk_ref_id,
			'metadata' => $metadata,
			'data' => $data
		]);
		Output::SetNotify('mode', 'updated');
	} else {
		if(!$blk_ref_name) {
			$rand = Security::GenerateUniqueInteger();
			$blk_ref_name = hash('crc32b', "$rand");
		}
		$row = Content_Blk_Ref::Create([
			'db' => $db,
			'blk_id' => $blk_id,
			'blk_ref_name' => $blk_ref_name,
			'metadata' => $metadata,
			'data' => $data
		]);
		$blk_ref_id = $row['blk_ref_id'];
		Output::SetNotify('blk_ref_name', $blk_ref_name);
		Output::SetNotify('mode', 'created');		
	}
	
	Content_Blk::RefreshHash([
		'db' => $db,
		'blk_id' => $blk_id
	]);
	
	Output::SetNotify('status', 'success');
	Output::SetNotify('blk_id', $blk_id);
	Output::SetNotify('blk_ref_id', $blk_ref_id);

	
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
		case 'access':
		case 'blk':
		case 'dashboard':
		case 'session':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
