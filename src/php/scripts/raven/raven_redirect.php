<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");

require_once("lib/webauth/webauth_raven.php");

$redirect_url = array_key_exists('redirect_url', $inputs) ? $inputs['redirect_url'] : "https://{$GLOBALS['hostname']}/";

try {
	$auth_url = WebAuth::GenerateURL([
 		'url' => "https://{$GLOBALS['hostname']}/php/index.php?action=raven_session",
 		'params' => [
 			'redirect_url' => $redirect_url
 		]
	]);
	Output::SetNotify("type", "success");
	Output::SetNotify("auth_url", $auth_url);
} catch (SKYException $e) {
	if($db) $db->rollback();
	
	$options = $e->GetOptions();
	switch($options['type']) {
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
