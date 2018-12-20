<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");
require_once("lib/blk/blk.php");

class Blk_Ref {
	const DATABASE_TABLE = 'blk_ref';

	use DatabaseQuery;
	const QUERY_TABLE = self::DATABASE_TABLE;
	const QUERY_SAFE_REQUESTS = ['blk_ref_id', 'blk_id', 'name', 'data'];
	const QUERY_BY_SAFE = ['blk_id', 'blk_ref_id'];
	
	use DatabaseUpdate;
	const UPDATE_TABLE = self::DATABASE_TABLE;
	const UPDATE_SAFE = ['blk_id', 'name', 'data'];
	const UPDATE_KEY = 'blk_ref_id';


	use DatabaseCreate {
		Create as DBCreate;
	}
	const CREATE_TABLE = self::DATABASE_TABLE;
	const CREATE_REQUIRED = ['blk_ref_id', 'blk_id', 'name'];
	const CREATE_SAFE = ['data'];
	public static function Create($data) {
		$ref = Blk::Query([
			'db' => $data['db'],
			'blk_id' => $data['blk_id']
		]);
		SKYException::CheckNULL($ref, 'blk', 'id_missing');
		$data['blk_ref_id'] = Security::GenerateUniqueInteger();
		$out = self::DBCreate($data);
		$out['blk_ref_id'] = $data['blk_ref_id'];
		return $out;
	}
}
?>
