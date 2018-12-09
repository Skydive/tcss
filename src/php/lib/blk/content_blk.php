<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Content_Blk {
	public static function Create($data) {
		$db = $data['db'];
		$metadata = $data['metadata'];

		$blk_id = Security::GenerateUniqueInteger();
		$blk_hash = hash("crc32b", "$time");
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
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'blk_id' => $blk_id
		];
	}

	public static function Fetch_Blk_Refs_From_Blk($data) {
		$db = $data['db'];
		$blk_id = $data['blk_id'];
		$count = array_key_exists('count', $data) ? (int)$data['count'] : 100;
		$index = array_key_exists('index', $data) ? (int)$data['index'] : 0;
		$query = "SELECT 
			a.blk_id, a.blk_hash, a.metadata AS blk_md,
			b.blk_ref_id, b.blk_ref_name, b.metadata AS ref_md, b.data 
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
		$blk_refs = self::Fetch_Blk_Refs_From_Blk([
			'db' => $db,
			'blk_id' => $blk_id
		]);

		// RECHECKSUM
		$blk_hash = '';
		foreach($blk_refs as $ref) {
			$blk_hash = hash('crc32b', $blk_hash.$ref->data);
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
	}

	// public static function Fetch($data) {
	// 	return self::Query([
	// 		'db' => $data['db'],
	// 		'blk_id' => $data['blk_id'],
	// 		'requests' => ['blk_id', 'blk_hash', 'metadata']
	// 	]);
	// }

	const QUERY_TABLE = 'content_blk';
	const QUERY_SAFE_REQUESTS = ['blk_id', 'blk_hash', 'metadata'];
	const QUERY_BY_SAFE = ['blk_id'];
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
