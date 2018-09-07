<?php 
require_once('webauth_raven.php');

if (isset($_SERVER['QUERY_STRING']) and preg_match('/^WLS-Response=/', $_SERVER['QUERY_STRING'])) {
	// Try to login
	$token_str = preg_replace('/^WLS-Response=/', '', rawurldecode($_SERVER['QUERY_STRING']));
	try {		
		$obj = WebAuth::TokenValidate([
			'raw_token' => $token_str
		]);
		echo("<code>Success:</code>")
		echo("<code>CRSID: ".$obj->token->principal."</code>");
		echo("<code>Parameters:</code>");
		foreach($obj['params'] as $k => $v) {
			echo("<code>\t$k => $v");
		}

	} catch(WLSException $e) {
		echo("<code>Failure:</code>");
		echo("<code>Code: ".$e->getCode()."</code>");
		echo("<code>Message: ".$e->getMessage()."</code>");
	}
	var_dump(
} else {
	$url = WebAuth::GenerateURL([
 		'url' => 'dev.precess.io/php/lib/webauth/login.php'
	]);
	header('Location: $url');
}
?>