<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Blk {
	const DATABASE_TABLE = 'blk';
	const TABLE_KEY = 'blk_id';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['blk_id', 'hash', 'metadata'];
	const QUERY_BY_SAFE = [self::TABLE_KEY];
	
	use DatabaseUpdate;
	const UPDATE_TABLE = self::DATABASE_TABLE;
	const UPDATE_SAFE = ['hash', 'metadata'];
	const UPDATE_KEY = self::TABLE_KEY;

	use DatabaseCreate {
		Create as DBCreate;
	}
	const CREATE_TABLE = self::DATABASE_TABLE;
	const CREATE_REQUIRED = ['blk_id', 'hash'];
	const CREATE_SAFE = ['metadata'];
	public static function Create($data) {
		$data['blk_id'] = array_key_exists('blk_id', $data) ? $data['blk_id'] : Security::GenerateUniqueInteger();
		$time = time();
		$data['hash'] = hash("crc32b", "$time");
		$out = self::DBCreate($data);
		$out['blk_id'] = $data['blk_id'];
		return $out;
	}

	public static function FetchBlkFull($data) {
		$db = $data['db'];
		$blk_id = $data['blk_id'];
		$count = array_key_exists('count', $data) ? (int)$data['count'] : 100;
		$index = array_key_exists('index', $data) ? (int)$data['index'] : 0;

		$blk = Blk::Query([
			'db' => $db,
			'blk_id' => $blk_id
		]);
		if(!$blk)return null;

		$query = "SELECT 
			b.blk_ref_id, b.name, b.data
			FROM blk a
			INNER JOIN blk_ref b ON a.blk_id = b.blk_id
			WHERE a.blk_id = :blk_id
			LIMIT $count OFFSET $index";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_id' => $blk_id
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
		$rows = $stmt->fetchAll(); 
		$blk_refs = [];
		foreach($rows as $row) {
			$blk_refs[$row['name']] = $row;
		}
		return [
			'blk_id' => $blk_id,
			'hash' => $blk['hash'],
			'metadata' => $blk['metadata'],
			'blk_refs' => $blk_refs
		];
	}

	public static function RefreshHash($data) {
		$db = $data['db'];
		$blk_id = $data['blk_id'];
		$salt = $data['salt'] || '';
		$blk = self::FetchBlkFull([
			'db' => $db,
			'blk_id' => $blk_id
		]);
		$blk_refs = $blk['blk_refs'];

		// RECHECKSUM
		$hash = $salt;
		foreach($blk_refs as $ref) {
			$hash = hash('crc32b', $hash.$ref['data']);
		}

		$query = "UPDATE blk
		SET	hash = :hash
		WHERE blk_id = :blk_id";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_id' => $blk_id,
			'hash' => $hash
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'hash' => $hash
		];
	}
}
?>
