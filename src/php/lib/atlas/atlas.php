<?php
require_once("lib/core/security.php");
require_once("lib/core/database.php");

class Atlas {
	public static function FromCRSID($data) {
		$db = $data['db'];

		$query = "SELECT * FROM raven_users WHERE crsid=:crsid LIMIT 1";
		$stmt = $db->prepare($query);

		$result = $stmt->execute([
			'crsid' => $data['crsid']
		]);
		SKYException::CheckNULL($result, "db", $stmt->errorInfo()[2]);

		if($stmt->rowCount() == 0) SKYException::Send([
			'type' => 'atlas',
			'error' => 'crsid_unknown'
		]);
		
		$atlas_row = $stmt->fetch();
		return $atlas_row;
	}
}
?>
