<?php 
require_once("config.php");
require_once("lib/core/output.php");

require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");

require_once("lib/webauth/webauth_raven.php");

$HOSTNAME = "dev.precess.io"
$REDIRECT_URL = "https://dev.precess.io/"

if (isset($_SERVER['QUERY_STRING']) and preg_match('/^WLS-Response=/', $_SERVER['QUERY_STRING'])) {
	$token_str = preg_replace('/^WLS-Response=/', '', rawurldecode($_SERVER['QUERY_STRING']));
	try {
		$obj = WebAuth::TokenValidate([
			'token_raw' => $token_str
		]);
		$crsid = $obj['token']->principal;

		try {
			$db = Database::Connect($GLOBALS['project_name']);

			// Check if user exists (functionify this at some point)
			$query = "SELECT user_id FROM users WHERE username=:username AND auth_provider=:auth_provider LIMIT 1";
			$stmt = $db->prepare($query);
			
			$result = $stmt->execute([
				'username' => $crsid
				'auth_provider' => "raven"
			]);
			SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

			$db->beginTransaction();

			$user_id = -1;
			if($stmt->rowCount() == 0) {  // User doesn't exist
				$user = User::Create([
					'db' => $db,
					'username' => $crsid,
					'auth_provider' => "raven"
				]);
				$user_id = $user->user_id;
			} else {
				$row_user = $stmt->fetchObject();
				SKYException::CheckNULL($row_user, "raven_login", "user_row_invalid");
				$user_id = $row_user->user_id;
			}

			Session::Create([
				'db' => $db,
				'user_id' => $user_id,
				'user_agent' => $_SERVER['HTTP_USER_AGENT'] ? $_SERVER['HTTP_USER_AGENT'] : "default-agent"
			]);

			$db->commit(); // OK since Session::Create is independent of User::Create
		} catch(SKYException $e) {
			error_log($e);
		}
		// Redirect to home page after session is generated
		header("Location: $REDIRECT_URL");		
} else {
	$url = WebAuth::GenerateURL([
 		'url' => "$HOSTNAME/php/lib/webauth/raven_login.php"
	]);
	header("Location: $url");
}
?>