<?php
chdir("/home/khalid/Git/precess-io/src/php");
require_once("config.php");
require_once("lib/core/database.php");

$handle = fopen("lib/admin/csv.txt", "r");
if ($handle) {
    $db = Database::Connect($GLOBALS['project_name']);
    $db->beginTransaction();

    while (($line = fgets($handle)) !== false) {
        $arr = explode(',', $line);
        $query = "INSERT INTO raven_users(
					crsid,
					display_name,
					surname,
					role,
					college
				) VALUES (
					:crsid,
					:display_name,
					:surname,
					:role,
					:college
				)";
		$stmt = $db->prepare($query);
		try {
			$stmt->execute([
				'crsid' => $arr[0],
				'display_name' => $arr[1],
				'surname' => $arr[2],
				'role' => $arr[3],
				'college' => $arr[4]
			]);
		} catch (PDOException $e) {
			print_r("{$e->getMessage()}\n");
		}
    }
    $db->commit();
    fclose($handle);
} else {
    // error opening the file.
}
?>