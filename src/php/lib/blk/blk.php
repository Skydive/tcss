<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

require_once("lib/blk/content_blk.php");
require_once("lib/blk/content_blk_ref.php");


class Blk {
	public static function Fetch_Blk_Refs_From_Blk($data) {
		return Content_Blk_Ref::Query([
			'db' => $data['db'],
			'blk_id' => $data['blk_id'],
			'request' => ['blk_ref_id', 'blk_id', 'metadata', 'data']
		]);
	}

	public static function Update_Blk_Ref($data) {
		// QUERY UPDATE TABLE content_blk_ref
		
		$row = Content_Blk_Ref::Query([
			'db' => $data['db'],
			'blk_ref_id' => $data['blk_ref_id'],
			'request' => ['blk_ref_id', 'blk_id']
		]);
		Content_Blk::Update([
			'db' => $data['db'],
			'blk_id' => $row['blk_id'],
			'blk_hash' => hash('crc32b', time())
		]);
	}
}
?>
