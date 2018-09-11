<?php
date_default_timezone_set('UTC');
// MAKE THIS WITH CONST CLASS VARS
// TODO: use an actual preprocessor for this single argument
DEFINE('DEVELOPMENT_MODE', true);

$GLOBALS['auth_providers'] = [
	'default' => 0,
	'raven' => 1
];

$GLOBALS['hostname'] = DEVELOPMENT_MODE ? $_SERVER['HTTP_HOST'] : 'precess.io';

$GLOBALS['project_name'] = 'precess-io';
$GLOBALS['dsn'] = 'mysql'; // or pgsql
$GLOBALS['databases'] = [
	$GLOBALS['project_name'] => [
		"host" => "172.17.0.1",
		"username" => "precess-io",
		"password" => "xaxaxaxa"
	]
];
$GLOBALS['hashsalts'] = [
	'base' => '617wvX3uA8eQVU',
	'password' => '617wvX3uA8eQVU!2&Xcn',
	'token' => '617wvX3uA8eQVU!2@Xcn'
];

?>
