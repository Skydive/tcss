<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];
$index = $inputs['index'] ? (int)$inputs['index'] : 0;
$count = $inputs['count'] ? (int)$inputs['count'] : QUERY_COUNT_DEFAULT;
$search_query = $inputs['search_query'] ?: "";
$group_id = array_key_exists('group_id', $inputs) ? (int)$inputs['group_id'] : -1;
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
	// Dynamically construct query
	/*$query = "SELECT
		a.user_id, a.username,
		c.group_id, c.display_name AS group_name, c.access_level,
		b.display_name, b.surname, b.college
	FROM users a
	INNER JOIN atlas b ON b.crsid = a.username
	INNER JOIN groups c ON c.group_id = a.group_id
	WHERE
		LOWER(b.crsid) LIKE LOWER(:crsid)
	OR	LOWER(b.display_name) LIKE LOWER(:display_name)
	ORDER BY NULLIF(LOWER(b.surname), '') ASC, b.crsid ASC NULLS LAST LIMIT $count OFFSET $index";*/

	$pairings = [];
	$query = "SELECT
		a.user_id, a.username,
		c.group_id, c.display_name AS group_name, c.access_level,
		b.display_name, b.surname, b.college
	FROM users a
	INNER JOIN atlas b ON b.crsid = a.username
	INNER JOIN groups c ON c.group_id = a.group_id";
	if($group_id != -1
	|| $search_query != "") {
		$query = "$query WHERE ";
	}
	if($search_query != "") {
		$query = "$query LOWER(b.crsid) LIKE LOWER(:crsid)
				  OR LOWER(b.display_name) LIKE LOWER(:display_name)";
		$pairings['crsid'] = "%{$search_query}%";
		$pairings['display_name'] = "%{$search_query}%";
		if($group_id != -1) {
			$query = "$query AND ";
		}
	}
	if($group_id != -1) {
		$query = "$query a.group_id = :group_id";
		$pairings['group_id'] = $group_id;
	}
	$query = "$query ORDER BY NULLIF(LOWER(b.surname), '') ASC, b.crsid ASC NULLS LAST LIMIT $count OFFSET $index";
	$stmt = $db->prepare($query);
	$result = $stmt->execute($pairings);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

	$out = $stmt->fetchAll();
	Output::SetNotify('status', 'success');
	Output::SetNotify('out', $out);
} catch (SKYException $e) {
	if($db) $db->rollback();
	SKYException::Notify();
}

?>
