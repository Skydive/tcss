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
	
	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	// MASSIVE TRIPLE JOIN RAINBOW QUERY
	// I want consistency of libraries over schema
	$query = "SELECT
		a.user_id, a.username,
		c.group_id, c.display_name AS group_name, c.access_level,
		b.display_name, b.surname, b.college
	FROM users a
	INNER JOIN atlas b ON b.crsid = a.username
	INNER JOIN groups c ON c.group_id = a.group_id
	WHERE
		LOWER(b.crsid) LIKE LOWER(:crsid)
	OR	LOWER(b.display_name) LIKE LOWER(:display_name)
	OR	LOWER(c.display_name) LIKE LOWER(:group_name)
	ORDER BY NULLIF(LOWER(b.surname), '') ASC, b.crsid ASC NULLS LAST LIMIT $count OFFSET $index";

	$stmt = $db->prepare($query);
	$result = $stmt->execute([
		'crsid' => "%{$search_query}%",
		'display_name' => "%{$search_query}%",
		'group_name' => "%{$search_query}%"
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
