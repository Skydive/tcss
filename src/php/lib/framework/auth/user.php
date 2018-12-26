<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class User {
	public static function Create($data) {
		$data['auth_provider'] = array_key_exists('auth_provider', $data) ? $data['auth_provider'] : "default";
		$auth_provider = array_key_exists($data['auth_provider'], $GLOBALS['cfg']['auth_providers']) ? $GLOBALS['cfg']['auth_providers'][$data['auth_provider']] : 0;
		$data['password'] = array_key_exists('password', $data) ? $data['password'] : Security::GenerateUniqueInteger();

		$db = $data['db'];
		$rows = User::Query([
				'db' => $db,
				'username' => $data['username'],
				'limit' => 1
		]);
		if($rows !== null) {
			SKYException::Send([
				'type' => 'user',
				'error' => 'exists'
			]);
		}

		/*$query = "SELECT user_id FROM users WHERE username=:username AND auth_provider=:auth_provider LIMIT 1";
		$stmt = $db->prepare($query);
		
		$result = $stmt->execute([
			'username' => $data['username'],
			'auth_provider' => $auth_provider
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		if($stmt->rowCount() != 0) */

		$user_id = Security::GenerateUniqueInteger();
		$password_hash = Security::GenerateHash([
			'data' => $data['password'],
			'salt_id' => 'password',
			'extra_salt' => "$user_id"
		]);
		
		$creation_date = date("Y-m-d G:i:s", time());
		
		$query = "INSERT INTO users(
				user_id,
				username,
				password_hash,
				auth_provider,
				creation_date
			) VALUES (
				:user_id,
				:username,
				:password_hash,
				:auth_provider,
				:creation_date
			)";

		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'user_id' => $user_id,
			'username' => $data['username'],
			'password_hash' => $password_hash,
			'auth_provider' => $auth_provider,
			'creation_date' => $creation_date
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'user_id' => $user_id
		];
	}

	public static function CredentialsValidate($data) {
		$db = $data['db'];

		$query = "SELECT user_id, password_hash FROM users WHERE username=:username AND active=true LIMIT 1";
		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'username' => $data['username']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		// username does not exist
		if($stmt->rowCount() == 0) SKYException::Send([
			'type' => 'user',
			'error' => 'invalid'
		]);
		$user_row = $stmt->fetch();

		$password_hash = Security::GenerateHash([
			'data' => $data['password'],
			'salt_id' => 'password',
			'extra_salt' => $user_row['user_id']
		]);

		// password invalid
		if($password_hash !== $user_row['password_hash']) SKYException::Send([
			'type' => 'user',
			'error' => 'invalid'
		]);

		return [
			'user_id' => $user_row['user_id']
		];
	}

	const QUERY_TABLE = 'users';
	const QUERY_SAFE_REQUESTS = ['user_id', 'username', 'auth_provider', 'creation_date', 'group_id', 'active'];
	const QUERY_BY_SAFE = ['user_id', 'username'];
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

	public static function AssignGroup($data) {
		$db = $data['db'];
		
		$query = "UPDATE users
				SET		group_id=:group_id
				WHERE	user_id=:user_id ";
		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'user_id' => $data['user_id'],
			'group_id' => $data['group_id']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	}
}
?>
