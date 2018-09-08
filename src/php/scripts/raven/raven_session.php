<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");
require_once("lib/webauth/webauth_raven.php");

$token_str = rawurldecode($inputs['WLS-Response']);

try {
	SKYException::CheckNULL($token_str, "raven", "wls_response_unspecified");

	try {
		$obj = WebAuth::TokenValidate([
			'token_raw' => $token_str
		]);
	} catch(WLSException $e) {
		SKYException::Send([
			'type' => 'raven',
			'error' => "wls_response",
			'code' => "{$e->getCode()}",
			'message' => "{$e->getMessage()}"
		]);
	}

	$crsid = $obj['token']->principal;

	$db = Database::Connect($GLOBALS['project_name']);
	// Check if user exists (functionify this at some point)
	// TODO: dilemma of uniqueness
	$query = "SELECT user_id FROM users WHERE username=:username AND auth_provider=:auth_provider LIMIT 1";
	$stmt = $db->prepare($query);
			
	$result = $stmt->execute([
		'username' => $crsid,
		'auth_provider' => 1
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$db->beginTransaction();

	// If user doesn't exist - create new one
	$user_id = -1;
	if($stmt->rowCount() == 0) {  
		$user = User::Create([
			'db' => $db,
			'username' => $crsid,
			'auth_provider' => "raven"
		]);
		$user_id = $user['user_id'];
	} else {
		$row_user = $stmt->fetch();
		$user_id = $row_user['user_id'];
	}

	$session = Session::Create([
		'db' => $db,
		'user_id' => $user_id,
		'user_agent' => $_SERVER['HTTP_USER_AGENT'] ? $_SERVER['HTTP_USER_AGENT'] : "default-agent"
	]);

	$db->commit(); // OK since Session::Create is independent of User::Create

	$redirect_url = array_key_exists('redirect_url', $obj['params']) ? $obj['params']['redirect_url'] : "https://{$GLOBALS['hostname']}/";

	print_r("test");
	header("Location: $redirect_url");
	// TODO: fix this cascade mess
	setcookie('session_token', $session['session_token'], 0, "/");
} catch (SKYException $e) {
	if($db) $db->rollback();
	
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'raven':
			Output::SetNotify("message", "{$options['message']}");
			Output::SetNotify("code", "{$options['code']}");
		case 'session':
		case 'user':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
	Output::PrintOutput();
	die();
}
?>
