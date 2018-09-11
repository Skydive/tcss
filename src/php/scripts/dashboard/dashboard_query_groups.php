<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

$session_token = (string)$_COOKIE['session_token'];
$index = $inputs['index'] ? (int)$inputs['index'] : 0;
$count = $inputs['count'] ? (int)$inputs['count'] : 10;
$search_query = $inputs['search_query'] ?: "";

try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	
	$db = Database::Connect($GLOBALS['project_name']);
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
	WHERE display_name LIKE :display_name 
	AND 0 < access_level AND access_level <= 100
	ORDER BY access_level ASC
	LIMIT $index,$count";

	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'display_name' => "%{$search_query}%"
	]);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$out = $stmt->fetchAll();

	Output::SetNotify('status', 'success');
	Output::SetNotify('out', $out);
} catch (SKYException $e) {
	$options = $e->GetOptions();
	switch($options['type']) {
		case 'db':
			if(!DEVELOPMENT_MODE) {
				Output::SetNotify("type", "failure_internal_error");
				break;
			}
		case 'dashboard':
		case 'session':
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			break;
		default:
			Output::SetNotify("type", "failure_unspecified");
			break;
	}
}
?>
