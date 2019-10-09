<?php
date_default_timezone_set('UTC');
// MAKE THIS WITH CONST CLASS VARS
// TODO: use an actual preprocessor for this single argument

// TODO: DEV_LEVEL + ENUMS
DEFINE('DEVELOPMENT_MODE', true);

$GLOBALS['cfg'] = [];
$GLOBALS['cfg']['hostname'] = $_SERVER['HTTP_HOST'];

$GLOBALS['cfg']['project_name'] = 'tcss';
$GLOBALS['cfg']['dsn'] = 'pgsql'; // or pgsql
$GLOBALS['cfg']['databases'] = [
	$GLOBALS['cfg']['project_name'] => [
		"dsn" => "pgsql",
		"username" => "tcss",
		"password" => "xaxaxaxa",
		"params" => [
			"host" => "tcss-pgsql",
			"dbname" => $GLOBALS['cfg']['project_name']
			//$charset = 'utf8mb4';
		]
	]
];

$GLOBALS['cfg']['hashsalts'] = [
	'base' => '617wvX3uA8eQVU',
	'password' => '617wvX3uA8eQVU!2&Xcn',
	'token' => '617wvX3uA8eQVU!2@Xcn'
];

$GLOBALS['cfg']['auth_providers'] = [
	'default' => 0,
	'raven' => 1
];

$GLOBALS['cfg']['blk'] = [];
$GLOBALS['cfg']['blk']['genesis'] = [
	'blk_id' => 1337,
	'metadata' => [],
	'content' => [
		'header'  => "<h1>Title</h1><h2>Title Sub</h2>",
		'body'  => "<p>Body</p>"
	]
];

$GLOBALS['security']['exceptions'] = [];
$GLOBALS['security']['exceptions']['default'] = [
	'access',
	'atlas',
	'blk',
	'dashboard',
	'session',
	'feed',
	'singleton',
	'user',
	'ct'
];
$GLOBALS['security']['exceptions']['dev'] = [
	'db'
];

$GLOBALS['feed']['valid'] = [
	'events',
	'news'
];

$GLOBALS['cfg']['web_root'] = "/www/build";
$GLOBALS['cfg']['upload_dir_rel'] = "/uploads";
$GLOBALS['cfg']['upload_dir'] = $GLOBALS['cfg']['web_root'].$GLOBALS['cfg']['upload_dir_rel'];

?>
