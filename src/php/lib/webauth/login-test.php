<?php 
require_once('webauth_raven.php');

if (isset($_SERVER['QUERY_STRING']) and preg_match('/^WLS-Response=/', $_SERVER['QUERY_STRING'])) {
	$token_str = preg_replace('/^WLS-Response=/', '', rawurldecode($_SERVER['QUERY_STRING']));
	try {		
		echo("<pre>");

		$obj = WebAuth::TokenValidate([
			'token_raw' => $token_str
		]);
		echo("<code>Success (Now for user / session generation):</code>");
		echo("<code>CRSID: ".$obj['token']->principal."</code>");
		echo("<code>Parameters:</code><br>");
		foreach($obj['params'] as $k => $v) {
			echo("<code>\t$k => $v</code></br>");
		}
		echo("<br><br><code>Token Information:</code><br>");
		foreach($obj['token'] as $k => $v) {
			echo("<code>\t$k => $v</code></br>");
		}
		
	} catch(WLSException $e) {
		echo("<code>Token:".$token_str."</code><br>");
		echo("<code>Failure:</code><br>");
		echo("<code>Code: ".$e->getCode()."</code><br>");
		echo("<code>Message: ".$e->getMessage()."</code><br>");
		die(0);
	}

	echo("</pre>");
} else {
	$url = WebAuth::GenerateURL([
 		'url' => 'dev.precess.io/php/lib/webauth/login-test.php'
	]);
	header("Location: $url");
}
?>