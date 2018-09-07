<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Session {
	// TODO:
	// Code session expiry after a ser period of time
	// i.e. logout date
	public static function Create($data) {
		$db = $data['db'];

		$session_token = Security::GenerateHash([
			'data' => Security::GenerateUniqueInteger(),
			'salt' => 'token'
		]);

		$login_date = time();

		$query = "INSERT INTO logins(
					user_id,
					session_token,
					user_agent,
					ip_address,
					login_date
				) VALUES (
					:user_id,
					:session_token,
					:user_agent,
					:ip_address,
					FROM_UNIXTIME(:login_date)
				)";
		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'user_id' => $data['user_id'],
			'session_token' => $session_token,
			'user_agent' => $data['user_agent'],
			'ip_address' => $_SERVER['REMOTE_ADDR'],
			'login_date' => $login_date
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		return [
			'insert_id' => $db->lastInsertId(),
			'session_token' => $session_token
		];
	}
	public static function TokenValidate($data) {
		$db = $data['db'];
		$query = "SELECT id, user_id FROM logins WHERE session_token=:session_token AND logout_date IS NULL AND active=1 LIMIT 1";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'session_token' => $data['session_token']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		$row_login = $stmt->fetchObject();
		SKYException::CheckNULL($row_login, "session", "token_invalid");

		return [
			'id' => $row_login->id,
			'user_id' => $row_login->user_id
		];
	}

	public static function Destroy($data) {
		$db = $data['db'];

		$cur_date = time();

		$query = "UPDATE logins 
				  SET	logout_date=FROM_UNIXTIME(:logout_date)
				  WHERE	id=:id 
				  AND 	logout_date IS NULL";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'id' => $data['id'],
			'logout_date' => $cur_date
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	}
}
?>
