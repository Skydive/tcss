<?php
// TODO: Constrict php paths to index.php
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
	case 'atlas_fetch':
		require_once("scripts/atlas/$action.php");
		break;
	case 'group_fetch':
		require_once("scripts/group/$action.php");
		break;
	case 'dashboard_query_users':
		require_once("scripts/dashboard/$action.php");
		break;
	case 'raven_session': // This is a DIRECT entrypoint - no AJAX
	case 'raven_redirect': // depends on raven_verify
		require_once("scripts/raven/$action.php");
		break;
	default:
		die("invalid action: $action");
		break;
}
Output::PrintOutput();
die();
?>
