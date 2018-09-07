<?php
require_once("config.php");
require_once("lib/core/output.php");

$inputs = $_POST ? $_POST : $_GET;

$action = $inputs['action'];
switch($action) {
	case 'user_login':
	case 'user_create':
	case 'user_verify':
	case 'user_logout':
		require_once("scripts/user/$action.php");
		break;
	default:
		die("invalid action: $action");
		break;
}
?>
