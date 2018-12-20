<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Atlas {
	const DATABASE_TABLE = 'atlas';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['crsid', 'display_name', 'surname', 'role', 'college'];
	const QUERY_BY_SAFE = ['crsid', 'surname', 'college'];
}
?>
