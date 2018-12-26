<?php
chdir("../../");
require_once("config.php");
require_once("lib/core/database.php");
require_once("lib/core/security.php");
require_once("lib/framework/auth/user.php");

$handle = fopen("lib/atlas/csv.txt", "r");
if ($handle) {
	$date = date("Y-m-d G:i:s");
    $db = Database::Connect($GLOBALS['cfg']['project_name']);
    $i = 0;
    while (($line = fgets($handle)) !== false) {
    	$db->beginTransaction();
        $arr = explode(',', $line);
        
		$user = User::Query([
			"db" => $db,
			"username" => $arr[0],
			"requests" => ['user_id', 'username'],
			"limit" => 1
		]);
		if($user !== null) {
			$db->rollBack();
			continue;
		}
		$query = "INSERT INTO users(
					user_id,
					username,
					password_hash,
					auth_provider,
					creation_date,
					group_id
				) VALUES (
					:user_id,
					:username,
					:password_hash,
					:auth_provider,
					:creation_date,
					:group_id
				)";
		$stmt = $db->prepare($query);

		$user_id = Security::GenerateUniqueInteger();
		$password_hash = Security::GenerateHash([
			'data' => Security::GenerateUniqueInteger(),
			'salt_id' => 'password',
			'extra_salt' => "$user_id",
			'algo' => 'sha512'
		]);
		try {
			$stmt->execute([
				'user_id' => Security::GenerateUniqueInteger(),
				'username' => $arr[0],
				'password_hash' => $password_hash,
				'auth_provider' => $GLOBALS['cfg']['auth_providers']['raven'],
				'creation_date' => $date,
				'group_id' => 2
			]);
		} catch (PDOException $e) {
			if($e->getCode() == 23505) {
				$db->rollBack();
				continue;
			}
			echo("{$e->getMessage()}\n");
			die();
		}

		$query = "INSERT INTO atlas(
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
			if($e->getCode() == 23505) {
				$db->rollBack();
				continue;
			}
			echo("{$e->getMessage()}\n");
			die();
		}
		$i++;
	    $db->commit();
    }
    echo("Added: $i users\n");
    fclose($handle);
} else {
    // error opening the file.
}
?>