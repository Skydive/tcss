<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");

$session_token = (string)$_COOKIE['session_token'];
$password = $inputs['password'];

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	SKYException::CheckNULL($password, "user", "password_unspecified");

	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	SKYException::CheckNULL($db, "db", "null");
	
	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$user = User::Query([
		"db" => $db,
		"user_id" => $token_data['user_id'],
		"requests" => ['user_id', 'username'],
		"limit" => 1
	]);
	if($user === null) {
		SKYException::Send([
			'type' => 'user',
			'error' => 'unmatched_user_id'
		]);
	}

	$password_hash = Security::GenerateHash([
		'data' => $password,
		'salt_id' => 'password',
		'extra_salt' => "".$token_data['user_id']
	]);
	
	
	$query = "UPDATE users
	SET password_hash = :password_hash
	WHERE user_id = :user_id";
	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'user_id' => $token_data['user_id'],
		'password_hash' => $password_hash
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
	
	Output::SetNotify("type", "success");
	Output::SetNotify("user_id", $user['user_id']);
	Output::SetNotify("hash", $password_hash);
} catch (SKYException $e) {
	SKYException::Notify();
}
?>
