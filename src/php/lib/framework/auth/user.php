<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class User {
	public static function Create($data) {
		$data['auth_provider'] = array_key_exists('auth_provider', $data) ? $data['auth_provider'] : "default";
		$auth_provider = array_key_exists($data['auth_provider'], $GLOBALS['auth_providers']) ? $GLOBALS['auth_providers'][$data['auth_provider']] : 0;
		$data['password'] = array_key_exists('password', $data) ? $data['password'] : Security::GenerateUniqueInteger();

		$db = $data['db'];

		$query = "SELECT user_id FROM users WHERE username=:username AND auth_provider=:auth_provider LIMIT 1";
		$stmt = $db->prepare($query);
		
		$result = $stmt->execute([
			'username' => $data['username'],
			'auth_provider' => $auth_provider
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		if($stmt->rowCount() != 0) SKYException::Send([
			'type' => 'user',
			'error' => 'exists'
		]);
		
		$user_id = Security::GenerateUniqueInteger();
		$password_hash = Security::GenerateHash([
			'data' => $data['password'],
			'salt_id' => 'password',
			'extra_salt' => "$user_id"
		]);
		
		$creation_date = time();
		
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
				FROM_UNIXTIME(:creation_date)
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
		$auth_provider = array_key_exists('default', $GLOBALS['auth_providers']) ? $GLOBALS['auth_providers']['default'] : 0;

		$db = $data['db'];

		$query = "SELECT user_id, password_hash FROM users WHERE username=:username AND auth_provider=:auth_provider AND active=1 LIMIT 1";
		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'username' => $data['username'],
			'auth_provider' => $auth_provider
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
			'user_id' => $user_row-['user_id']
		];
	}

	public static function GetByID($data) {
		$db = $data['db'];

		$query = "SELECT * FROM users WHERE user_id=:user_id AND active=1 LIMIT 1";

		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'user_id' => $data['user_id']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		if($stmt->rowCount() == 0) SKYException::Send([
			'type' => 'user',
			'error' => 'invalid_id'
		]);
		
		$user_row = $stmt->fetch();
		return $user_row;
	}
}
?>
