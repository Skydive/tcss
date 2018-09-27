<?php
require_once("lib/core/database.php");
require_once("lib/core/exception.php");
require_once("lib/framework/auth/session.php");

require_once("scripts/dashboard/dashboard_config.php");

$session_token = (string)$_COOKIE['session_token'];
$user_id_list =  $inputs['user_id_list'] ?: null;
try {
	SKYException::CheckNULL($session_token, "session", "token_unspecified");
	SKYException::CheckNULL($user_id_list, "dashboard", "user_id_list_unspecified");

	$db = Database::Connect($GLOBALS['project_name']);
	SKYException::CheckNULL($db, "db", "null");

	$token_data = Session::TokenValidate([
		"db" => $db,
		"session_token" => $session_token
	]);

	$pairings = [];
	$query = "SELECT
		a.user_id, a.username,
		c.group_id, c.display_name AS group_name, c.access_level,
		b.display_name, b.surname, b.college
	FROM users a
	INNER JOIN atlas b ON b.crsid = a.username
	INNER JOIN groups c ON c.group_id = a.group_id
	WHERE ";

	for($i=0; $i<sizeof($user_id_list); $i++) {
		if($i != 0) {
			$query = "OR $query";
		}
		$query = "$query a.user_id = :entry_$i";
		$pairings["entry_$i"] = $user_id_list[$i];
	}
	$query = "$query ORDER BY NULLIF(LOWER(b.surname), '') ASC, b.crsid ASC NULLS LAST";
	$stmt = $db->prepare($query);
	$result = $stmt->execute($pairings);
	SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
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
