<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

require_once("lib/framework/auth/user.php");
require_once("lib/blk/content_blk.php");

class Events {
	const DATABASE_TABLE = 'events';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['event_id', 'blk_id', 'user_owner'];
	const QUERY_BY_SAFE = ['event_id'];
	
	use DatabaseUpdate;
	const UPDATE_TABLE = self::DATABASE_TABLE;
	const UPDATE_SAFE = ['event_date', 'user_owner'];
	const UPDATE_KEY = 'event_id';

	use DatabaseCreate {
		Create as DBCreate;
	}
	const CREATE_TABLE = self::DATABASE_TABLE;
	const CREATE_REQUIRED = ['event_id', 'blk_id', 'event_date', 'user_owner'];
	const CREATE_SAFE = [];
	public static function Create($data) {
		$ref = Content_Blk::Query([
			'db' => $data['db'],
			'blk_id' => $data['blk_id'],
			'limit' => 1
		]);
		SKYException::CheckNULL($ref, 'blk', 'id_missing');

		$user = User::Query([
			'db' => $data['db'],
			'user_id' => $data['user_owner'],
			'limit' => 1
		]);
		SKYException::CheckNULL($user, 'user', 'id_missing');

		$data['event_id'] = Security::GenerateUniqueInteger();
		$out = self::DBCreate($data);
		$out['event_id'] = $data['event_id'];
		return $out;
	}
}
?>
