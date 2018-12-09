<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

trait DatabaseQuery {
	public static function Update($data) {
		$db = $data['db'];
		$update_for = array_intersect(array_keys($data), self::UPDATE_SAFE);

		$key = self::UPDATE_KEY;
		$tbl = self::QUERY_TABLE;
		$query = "UPDATE $tbl";
		$updates = implode(',', array_map(function($q){return " $q = :$q";}, $update_for));
		$query = "$query SET $updates WHERE $key = :$key";

		$execute = []; 
		$execute[$key] = $data[$key];
		foreach($update_for as $q) {
			$execute[$q] = $data[$q];
		}

		$stmt = $db->prepare($query);
		$result = $stmt->execute($execute);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	}
}
trait DatabaseUpdate {
	public static function Query($data) {
		$db = $data['db'];
		$query_for = array_key_exists('requests', $data) ? array_intersect(self::QUERY_SAFE_REQUESTS, $data['requests']) : self::QUERY_SAFE_REQUESTS;
		$limit = array_key_exists('limit', $data) ? (int)$data['limit'] : 1;
		$selection = implode(',', $query_for);
		
		foreach(self::QUERY_BY_SAFE as $q) {
			if(array_key_exists($q, $data)) {
				$tbl = self::QUERY_TABLE;
				$query = "SELECT $selection FROM $tbl WHERE $q=:$q LIMIT $limit";

				$stmt = $db->prepare($query);
				$result = $stmt->execute([
					"$q" => $data[$q]
				]);
				SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
				if($stmt->rowCount() == 0) {
					return null;
				}
				return $limit == 1 ? $stmt->fetch() : $stmt->fetchAll();
				break;
			}
			
		}
		return null;
	}
}

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
