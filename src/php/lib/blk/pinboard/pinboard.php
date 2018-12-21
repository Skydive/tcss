<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

require_once("lib/framework/auth/user.php");
require_once("lib/blk/blk.php");
require_once("lib/blk/blk_ref.php");

class Pinboard {
	public static function Create($data) {
		$db = $data['db'];
		$pinboard_type = $data['pinboard_type'];
		$pinboard_pos = $data['pinboard_pos'];

		$query = "SELECT
			a.user_id, a.username,
			b.display_name AS group_name, b.access_level
			c.display_name AS display_name
		FROM users a
		INNER JOIN groups b ON a.group_id = b.group_id,
		INNER JOIN atlas c ON a.username = c.crsid
		WHERE a.user_id = :user_id";
		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'user_id' => $data['user_id']
		]);
		$row = $stmt->fetch();
		SKYException::CheckNULL($result, 'feed', 'user_id_missing');

		$blk = Blk::Create([
			'db' => $db,
			'metadata' => json_encode([
				'handler' => $pinboard_type,
				'position' => $pinboard_pos,

				'owner_id' => $row['user_id'],
				'owner_username' => $row['username'],
				'owner_display_name' => $row['display_name'],
				'owner_group_name' => $row['group_name'],
				'access_level' => $row['access_level']
			])
		]);

		return $blk;
	}

	public static function FetchHashes($data) {
		$db = $data['db'];
		$pinboard_type = $data['pinboard_type'];

		$query = "SELECT
			blk_id, hash, metadata
		FROM blk
		WHERE (metadata ->> 'handler') = :handler
		AND (metadata ->> 'position') IS NOT NULL
		AND active = TRUE
		ORDER BY (metadata ->> 'position') ASC";

		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'handler' => $data['pinboard_type']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
		$rows = $stmt->fetchAll();

		return $rows;
	}
}
?>
