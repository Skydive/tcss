<?php
require_once("lib/core/exception.php");
class Database {
	public static function Connect($database) {
		$params = "";
		foreach($GLOBALS['databases'][$database]['params'] as $k => $v) {
			$params = "$params;$k=$v";
		}
		$dsn = $GLOBALS['databases'][$database]['dsn'];
		$user = $GLOBALS['databases'][$database]['username'];
		$pass = $GLOBALS['databases'][$database]['password'];
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
?>
