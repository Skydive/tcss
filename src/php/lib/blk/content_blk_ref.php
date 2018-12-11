<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Content_Blk_Ref {
	const DATABASE_TABLE = 'content_blk_ref';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['blk_ref_id', 'blk_ref_name', 'blk_id', 'metadata', 'data'];
	const QUERY_BY_SAFE = ['blk_id', 'blk_ref_id'];
	
	use DatabaseUpdate;
	const UPDATE_TABLE = self::DATABASE_TABLE;
	const UPDATE_SAFE = ['blk_id', 'blk_ref_name', 'metadata', 'data'];
	const UPDATE_KEY = 'blk_ref_id';

	//use DatabaseCreate;
	public static function Create($data) {
		$db = $data['db'];
		$metadata = $data['metadata'] ?: (new stdClass());
		$blk_id = $data['blk_id'];
		$blk_ref_name = $data['blk_ref_name'];
		$data = $data['data'];


		$ref = Content_Blk::Query([
			'db' => $db,
			'blk_id' => $blk_id,
			'request' => ['blk_id']
		]);
		if(!$ref) throw SKYException::Send([
			'type' => 'blk',
			'error' => 'id_missing'
		]);


		$blk_ref_id = Security::GenerateUniqueInteger();

		$query = "INSERT INTO content_blk_ref(
			blk_ref_id,
			blk_id,
			blk_ref_name,
			data,
			metadata
		) VALUES (
			:blk_ref_id,
			:blk_id,
			:blk_ref_name,
			:data,
			:metadata
		)";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_ref_id' => $blk_ref_id,
			'blk_id' => $blk_id,
			'blk_ref_name' => $blk_ref_name,
			'data' => $data,
			'metadata' => $metadata
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'blk_ref_id' => $blk_ref_id
		];
	}
}
?>
