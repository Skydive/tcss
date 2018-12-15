<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Content_Blk {
	const DATABASE_TABLE = 'content_blk';
	const TABLE_KEY = 'blk_id';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['blk_id', 'blk_hash'];
	const QUERY_BY_SAFE = [self::TABLE_KEY];
	
	use DatabaseUpdate;
	const UPDATE_TABLE = self::DATABASE_TABLE;
	const UPDATE_SAFE = ['blk_hash', 'data'];
	const UPDATE_KEY = self::TABLE_KEY;

	use DatabaseCreate {
		Create as DBCreate;
	}
	const CREATE_TABLE = self::DATABASE_TABLE;
	const CREATE_REQUIRED = ['blk_id', 'blk_hash'];
	const CREATE_SAFE = [];
	public static function Create($data) {
		$data['blk_id'] = Security::GenerateUniqueInteger();
		$time = time();
		$data['blk_hash'] = hash("crc32b", "$time");
		$out = self::DBCreate($data);
		$out['blk_id'] = $data['blk_id'];
		return $out;
	}

	public static function Fetch_Blk_Refs_From_Blk($data) {
		$db = $data['db'];
		$blk_id = $data['blk_id'];
		$count = array_key_exists('count', $data) ? (int)$data['count'] : 100;
		$index = array_key_exists('index', $data) ? (int)$data['index'] : 0;
		$query = "SELECT 
			a.blk_id, a.blk_hash,
			b.blk_ref_id, b.blk_ref_name, b.data 
			FROM content_blk a
			INNER JOIN content_blk_ref b ON a.blk_id = b.blk_id
			WHERE a.blk_id = :blk_id
			LIMIT $count OFFSET $index";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_id' => $blk_id
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
		return $stmt->fetchAll(); 
	}

	public static function RefreshHash($data) {
		$db = $data['db'];
		$blk_id = $data['blk_id'];
		$salt = $data['salt'] || '';
		$blk_refs = self::Fetch_Blk_Refs_From_Blk([
			'db' => $db,
			'blk_id' => $blk_id
		]);

		// RECHECKSUM
		$blk_hash = $salt;
		foreach($blk_refs as $ref) {
			$blk_hash = hash('crc32b', $blk_hash.$ref['data']);
		}

		$query = "UPDATE content_blk
		SET	blk_hash = :blk_hash
		WHERE blk_id = :blk_id";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_id' => $blk_id,
			'blk_hash' => $blk_hash
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'blk_hash' => $blk_hash
		];
	}
}
?>
