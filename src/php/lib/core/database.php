<?php
require_once("lib/core/exception.php");
class Database {
	public static function Connect($database) {
		SKYException::CheckNULL($GLOBALS['cfg']['databases'][$database], 'db', 'not_exists');
		$params = "";
		foreach($GLOBALS['cfg']['databases'][$database]['params'] as $k => $v) {
			$params = "$params;$k=$v";
		}
		$dsn = $GLOBALS['cfg']['databases'][$database]['dsn'];
		$user = $GLOBALS['cfg']['databases'][$database]['username'];
		$pass = $GLOBALS['cfg']['databases'][$database]['password'];
		$dsn = "$dsn:$params";
		$opt = [
			PDO::ATTR_ERRMODE			 => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
			PDO::ATTR_EMULATE_PREPARES	 => false,
		//	PDO::ATTR_AUTOCOMMIT		 => false
		];
		try {
			$db = new PDO($dsn, $user, $pass, $opt);
		} catch (PDOException $e) {
			SKYException::Send(['type' => 'db', 'error' => "connection_failed_".$e->getMessage()]);
		}
		SKYException::CheckNULL($db, "db", "null");
		return $db;
	}
}

trait DatabaseCreate {
	public static function Create($data) {
		$db = $data['db'];

		$tbl = self::CREATE_TABLE;
		$create_union = array_merge(self::CREATE_REQUIRED, self::CREATE_SAFE);
		$create_fields = array_intersect(array_keys($data), $create_union);
		$create_fields = array_filter($create_fields, function($q) use ($data) {return $data[$q] != null;}); // Cleanse nulls
		$field_string = implode(',', $create_fields);
		$field_pl_string = implode(',', array_map(function($q){return ":$q";}, $create_fields));
		$query = "INSERT INTO $tbl($field_string) VALUES ($field_pl_string)";


		$execute = [];
		foreach($create_fields as $q) {
			$execute[$q] = $data[$q];
		}

		$stmt = $db->prepare($query);

		try { 
			$result = $stmt->execute($execute);
		} catch(PDOException $e) {
			SKYException::Send([
				'type' => 'db',
				'error' => $e->getMessage()
			]);
		}

		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId()
		];
	}
}

trait DatabaseQuery {
	// TODO: $data['update'] specify fields, if NULL ignore
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
		try { 
			$result = $stmt->execute($execute);
		} catch(PDOException $e) {
			SKYException::Send([
				'type' => 'db',
				'error' => $e->getMessage()
			]);
		}
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
?>
