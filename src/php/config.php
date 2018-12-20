<?php
date_default_timezone_set('UTC');
// MAKE THIS WITH CONST CLASS VARS
// TODO: use an actual preprocessor for this single argument

// TODO: DEV_LEVEL + ENUMS
DEFINE('DEVELOPMENT_MODE', true);



// DEVELOPMENT_MODE ? 'dev.precess.io' : 

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
			"host" => "pgsql",
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

$GLOBALS['security']['exceptions'] = [];
$GLOBALS['security']['exceptions']['default'] = [
	'access',
	'atlas',
	'blk',
	'dashboard',
	'session',
	'feed'
];
$GLOBALS['security']['exceptions']['dev'] = [
	'db'
];

$GLOBALS['feed']['valid'] = [
	'events',
	'news'
]
?>
