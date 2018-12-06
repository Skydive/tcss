<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Content_Blk_Ref {
	public static function Create($data) {
		$db = $data['db'];
		$metadata = $data['metadata'] ?: (new stdClass());
		$blk_id = $data['blk_id'];
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
			data,
			metadata
		) VALUES (
			:blk_ref_id,
			:blk_id,
			:data,
			:metadata
		)";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'blk_ref_id' => $blk_ref_id,
			'blk_id' => $blk_id,
			'data' => $data,
			'metadata' => $metadata
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'blk_ref_id' => $blk_ref_id
		];
	}

	public static function Update($data) {
		$db = $data['db'];
		$blk_ref_id = $data['blk_ref_id'];
		$metadata = $data['metadata'];

		// QUERY UPDATE TABLE content_blk_ref
		$ref = self::Query([
			'db' => $db,
			'blk_ref_id' => $blk_ref_id,
			'request' => ['blk_ref_id', 'blk_id']
		]);
		if(!$ref) throw SKYException::Send([
			'type' => 'blk',
			'error' => 'ref_id_missing'
		]);

		$query = "UPDATE content_blk_ref
			SET data = :data,
			metadata = :metadata
			WHERE blk_ref_id = :blk_ref_id";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'data' => $data['data'],
			'metadata' => $metadata,
			'blk_ref_id' => $blk_ref_id
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	}

	const QUERY_TABLE = 'content_blk_ref';
	const QUERY_SAFE_REQUESTS = ['blk_ref_id', 'blk_id', 'metadata', 'data'];
	const QUERY_BY_SAFE = ['blk_id', 'blk_ref_id'];
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
?>
