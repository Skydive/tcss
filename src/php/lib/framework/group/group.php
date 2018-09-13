<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Group {
	public static function Create($data) {
		$db = $data['db'];

		$db = $data['db'];
		$rows = Group::Query([
				'db' => $db,
				'name' => $data['name'],
				'limit' => 1
		]);
		if($rows !== null) {
			SKYException::Send([
				'type' => 'group',
				'error' => 'exists'
			]);
		}
		
		$group_id = Security::GenerateUniqueInteger();

		$creation_date = date("Y-m-d G:i:s", time());
		$query = "INSERT INTO groups(
				group_id,
				name,
				display_name,
				access_level,
				creation_date
			) VALUES (
				:group_id,
				:name,
				:display_name,
				:access_level,
				:creation_date
			)";

		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'group_id' => $group_id,
			'name' => $data['name'],
			'display_name' => $data['display_name'],
			'access_level' => $data['access_level'],
			'creation_date' => $creation_date
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'group_id' => $group_id
		];
	}

	// TODO: Code a JOIN QUERY system that scales sufficiently well
	const QUERY_SAFE_REQUESTS = ['group_id', 'name', 'display_name', 'access_level', 'creation_date', 'active']; // injection risk (Intersection ensures security)
	const QUERY_BY_SAFE = ['group_id', 'name', 'display_name'];
	public static function Query($data) {
		$db = $data['db'];
		$query_for = array_key_exists('requests', $data) ? array_intersect(Group::QUERY_SAFE_REQUESTS, $data['requests']) : Group::QUERY_SAFE_REQUESTS;
		$limit = array_key_exists('limit', $data) ? (int)$data['limit'] : 1;
		$selection = implode(',', $query_for);
		
		foreach(Group::QUERY_BY_SAFE as $q) {
			if(array_key_exists($q, $data)) {
				$query = "SELECT $selection FROM groups WHERE $q=:$q LIMIT $limit";
				$stmt = $db->prepare($query);
				$result = $stmt->execute([
					$q => $data[$q]
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
