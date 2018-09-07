<?php 
require_once('webauth_raven.php');

if (isset($_SERVER['QUERY_STRING']) and preg_match('/^WLS-Response=/', $_SERVER['QUERY_STRING'])) {
	$token_str = preg_replace('/^WLS-Response=/', '', rawurldecode($_SERVER['QUERY_STRING']));
	try {		
		echo("<pre>");

		$obj = WebAuth::TokenValidate([
			'token_raw' => $token_str
		]);
		echo("<code>Success:</code>\n");
		echo("<code>CRSID: ".$obj['token']->principal."</code>\n");
		echo("<code>Parameters:</code>\n");
		foreach($obj['params'] as $k => $v) {
			echo("<code>\t$k => $v</code>\n");
		}
		echo("<br><br><code>Token Information:</code>\n");
		foreach($obj['token'] as $k => $v) {
			echo("<code>\t$k => $v</code></br>\n");
		}
		
	} catch(WLSException $e) {
		//echo("<code>Token:".$token_str."</code>\n");
		echo("<code>Failure:</code>\n");
		echo("<code>Code: ".$e->getCode()."</code>\n");
		echo("<code>Message: ".$e->getMessage()."</code>\n");
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