<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

require_once("lib/framework/auth/user.php");
require_once("lib/blk/blk.php");
require_once("lib/blk/blk_ref.php");

class Feed {
	public static function Create($data) {
		$db = $data['db'];
		$feed_type = $data['feed_type'];
		$feed_date = $data['feed_date'];

		$query = "SELECT
			a.user_id, a.username,
			b.display_name, b.access_level 
		FROM users a
		INNER JOIN groups b ON a.group_id = b.group_id
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
				'handler' => $feed_type,
				'feed_date' => $feed_date,
				'owner_id' => $row['user_id'],
				'owner_username' => $row['username'],
				'owner_group_name' => $row['display_name'],
				'access_level' => $row['access_level']
			])
		]);

		return $blk;
	}

	public static function FetchHashDateRange($data) {
		$db = $data['db'];
		$feed_type = $data['feed_type'];
		$date_start = $data['date_start'];
		$date_end = $data['date_end'];

		$query = "SELECT
			blk_id, hash, metadata
		FROM blk
		WHERE (metadata ->> 'handler') = :handler
		AND (metadata ->> 'feed_date')::bigint > :date_start
		AND	(metadata ->> 'feed_date')::bigint < :date_end
		AND active = TRUE";

		$stmt = $db->prepare($query);
		$result = $stmt->execute([
			'handler' => $data['feed_type'],
			'date_start' => $data['date_start'],
			'date_end' => $data['date_end']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);
		$rows = $stmt->fetchAll();

		return $rows;
	}
}
?>
