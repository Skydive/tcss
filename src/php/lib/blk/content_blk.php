<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Content_Blk {
	public static function Fetch($data) {
		return self::Query([
			'db' => $data['db'],
			'blk_id' => $data['blk_id'],
			'requests' => ['blk_id', 'blk_hash', 'metadata']
		]);
	}

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
