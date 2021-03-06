<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];
$index = $inputs['index'] ? (int)$inputs['index'] : 0;
$count = $inputs['count'] ? (int)$inputs['count'] : QUERY_COUNT_DEFAULT;
$search_query = $inputs['search_query'] ?: "";

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['cfg']['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	// MASSIVE TRIPLE JOIN RAINBOW QUERY
	// I want consistency of libraries over schema
	$query = "SELECT 
		group_id, name, display_name, access_level 
	FROM groups 
	WHERE LOWER(display_name) LIKE LOWER(:display_name) 
	AND ".Query::ACCESS_LEVEL_MIN." <= access_level AND access_level <= ".Query::ACCESS_LEVEL_MAX."
	ORDER BY access_level ASC
	LIMIT $count OFFSET $index";

	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'display_name' => "%{$search_query}%"
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$out = $stmt->fetchAll();

	Output::SetNotify('status', 'success');
	Output::SetNotify('out', $out);
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}
?>
