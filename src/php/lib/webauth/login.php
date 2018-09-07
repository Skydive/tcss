<?php 
require_once('webauth_raven.php');

if (isset($_SERVER['QUERY_STRING']) and preg_match('/^WLS-Response=/', $_SERVER['QUERY_STRING'])) {
	$token_str = preg_replace('/^WLS-Response=/', '', rawurldecode($_SERVER['QUERY_STRING']));
	/*
	$obj = WebAuth::TokenValidate([
			'token_raw' => $token_str
		]);
		$crsid = $obj['token']->principal;
	*/
				
} else {
	$url = WebAuth::GenerateURL([
 		'url' => 'dev.precess.io/php/lib/webauth/login.php'
	]);
	header("Location: $url");
}
?>