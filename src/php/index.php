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
	case 'dashboard_query_groups':
	case 'dashboard_group_assign':
	case 'dashboard_group_add':
	case 'dashboard_group_remove':
		require_once("scripts/dashboard/$action.php");
		break;
	//case 'blk_create':
	case 'blk_fetch':
	case 'blk_hash_fetch':
	//case 'blk_ref_update':
		require_once("scripts/blk/$action.php");
		break;
	case 'singleton_update':
	case 'singleton_delete': // FEED/PINBOARD/SINGLETON (GENERALISED)
		require_once("scripts/singleton/$action.php");
		break;
	case 'feed_hash_fetch':
	case 'feed_delete':
		require_once("scripts/feed/$action.php");
		break;
	case 'raven_session': // This is a DIRECT entrypoint - no AJAX
	case 'raven_redirect': // depends on raven_verify
		require_once("scripts/raven/$action.php");
		break;
	case 'ct_image_upload':
		require_once("scripts/contenttools/$action.php");
	default:
		die("invalid action: $action");
		break;
}
Output::PrintOutput();
die();
?>
