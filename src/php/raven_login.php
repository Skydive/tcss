<?php 
require_once("config.php");
require_once("lib/core/output.php");

require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");
require_once("lib/framework/auth/user.php");

require_once("lib/webauth/webauth_raven.php");

$HOSTNAME = "dev.precess.io";
$REDIRECT_URL = "https://dev.precess.io/";

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
				'username' => $crsid,
				'auth_provider' => 1
			]);
			SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

			$db->beginTransaction();

			$user_id = -1;
			if($stmt->rowCount() == 0) {  // User doesn't exist
				print_r("USER DOESNT EXIST\n");
				$user = User::Create([
					'db' => $db,
					'username' => $crsid,
					'auth_provider' => "raven"
				]);
				var_dump($user);
				$user_id = $user['user_id'];
			} else {
				$row_user = $stmt->fetch();
				SKYException::CheckNULL($row_user, "raven_login", "user_row_invalid");
				$user_id = $row_user['user_id'];
			}

			$session = Session::Create([
				'db' => $db,
				'user_id' => $user_id,
				'user_agent' => $_SERVER['HTTP_USER_AGENT'] ? $_SERVER['HTTP_USER_AGENT'] : "default-agent"
			]);

			$db->commit(); // OK since Session::Create is independent of User::Create

			header("Location: $REDIRECT_URL");
			setcookie('session_token', $session['session_token'], 0, "/", $HOSTNAME, true);

		} catch(SKYException $e) {
			error_log($e);
			die("Something has gone horribly wrong...");
		}
		// Redirect to home page after session is generated
	} catch(WLSException $e) {
		echo("<code>Failure:</code><br/>
			<code>Code: {$e->getCode()}</code><br/>
			<code>Message: {$e->getMessage()}</code>");
		die(0);
	}
} else {
	$url = WebAuth::GenerateURL([
 		'url' => "$HOSTNAME/php/raven_login.php"
	]);
	header("Location: $url");
}
?>