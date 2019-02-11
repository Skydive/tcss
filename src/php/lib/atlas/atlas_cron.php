<?php
$college = array(
    "CAIUS"     => ["CAIUS", "CAIUSUG", "CAIUSPG"],
    "CHRIST"    => ["CHRISTS", "CHRSTUG", "CHRSTPG"],
    "CHURCH"    => ["CHURCH", "CHURUG", "CHURPG"],
    "CLARE"     => ["CLARE", "CLAREUG", "CLAREPG"],
    "CLAREH"    => ["CLAREH", "CLARHPG"],
    "CORPUS"    => ["CORPUS", "CORPUG", "CORPPG"],
    "DARWIN"    => ["DARWIN", "DARPG"],
    "DOWN"      => ["DOWN", "DOWNUG", "DOWNPG"],
    "EMM"       => ["EMM", "EMMUG", "EMMPG"],
    "GIRTON"    => ["GIRTON", "GIRTUG", "GIRTPG"],
    "HOM"       => ["HOM", "HOMUG", "HOMPG"],
    "HUGES"     => ["HUGHES", "HUGHUG", "HUGHPG"],
    "JESUS"     => ["JESUS", "JESUSUG", "JESUSPG"],
    "KINGS"     => ["KINGS", "KINGSUG", "KINGSPG"],
    "LCC"       => ["LCC", "LCCUG", "LCCPG"],
    "MAGD"      => ["MAGD", "MAGDUG", "MAGDPG"],
    "NEWH"      => ["NEWH", "NEWHUG", "NEWHPG"],
    "NEWN"      => ["NEWN", "NEWNUG", "NEWNPG"],
    "PEMB"      => ["PEMB", "PEMBUG", "PEMBPG"],
    "ROBIN"     => ["ROBIN", "ROBINUG", "ROBINPG"],
    "SEL"       => ["SEL", "SELUG", "SELPG"],
    "SID"       => ["SID", "SIDUG", "SIDPG"],
    "CATH"      => ["CATH", "CATHUG", "CATHPG"],
    "EDMUND"    => ["EDMUND", "EDMUG", "EDMPG"],
    "JOHNS"     => ["JOHNS", "JOHNSUG", "JOHNSPG"],
    "TRIN"      => ["TRIN", "TRINUG", "TRINPG"],
    "TRINH"     => ["TRINH", "TRINHUG", "TRINHPG"],
    "FITZ"      => ["FITZ", "FITZUG", "FITZPG"],
    "WOLF"      => ["WOLFC", "WOLFCUG", "WOLFCPG"],
    "QUEENS"    => ["QUEENS", "QUENUG", "QUENPG"],
    "RIDLEY"    => ["RIDLEY"]
);

function GetCollegeMembers($college, $id) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,"https://anonymous:@lookup-test.csx.cam.ac.uk/api/v1/inst/".$id."/members?fetch=all_attrs&format=json");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    $members = [];
    if(isset($result->result->people)) {
        foreach($result->result->people as $p) {
            $crsid = $p->identifier->value;
            $display_name = isset($p->displayName) ? $p->displayName : (
                isset($p->visibleName) ? $p->visibleName : (
                    isset($p->registeredName) ? $p->registeredName : $p->surname
                    )
                );
            $surname = isset($p->surname) ? $p->surname : "";
            $role = isset($p->misAffiliation) ? $p->misAffiliation : "student";
            $members[] = [
            	'crsid' => $crsid,
            	'display_name' => $display_name,
            	'surname' => $surname,
            	'role' => $role,
            	'college' => $college,
            	'id' => $id
            ];

        }
    } else {
        print_r($id);
        print_r($result);
    }
    return $members;
}

chdir("../../");
require_once("config.php");
require_once("lib/core/database.php");
require_once("lib/core/security.php");
require_once("lib/framework/auth/user.php");

$file = fopen("atlas_cron_log.txt", "a");

$total_count = 0;
$added_users = "";
$added_users_count = 0;
$cur_date = date("Y-m-d G:i:s");
foreach($college as $name => $arr) {
	$member_list = [];
    print_r("Current College: $name\n");
    foreach($arr as $id) {
    	$member_list = array_merge($member_list, GetCollegeMembers($name, $id));
    }
	$c = sizeof($member_list);
	$total_count += $c;
	print_r("Count: $c\n");
    $db = Database::Connect($GLOBALS['cfg']['project_name']);
	foreach($member_list as $member) {
		$db->beginTransaction();
		$user = User::Query([
			"db" => $db,
			"username" => $member['crsid'],
			"requests" => ['user_id', 'username'],
			"limit" => 1
		]);
		if($user !== null) { // USER EXISTS
			$db->rollBack();
			continue;
		} else {
			$query_atlas = "INSERT INTO atlas(
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
			$stmt_atlas = $db->prepare($query_atlas);

			$query_user = "INSERT INTO users(
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
			$stmt_user = $db->prepare($query_user);
			$user_id = Security::GenerateUniqueInteger();
			$password_hash = Security::GenerateHash([
				'data' => Security::GenerateUniqueInteger(),
				'salt_id' => 'password',
				'extra_salt' => "$user_id",
				'algo' => 'sha512'
			]);
			try {
				$stmt_user->execute([
					'user_id' => Security::GenerateUniqueInteger(),
					'username' => $member['crsid'],
					'password_hash' => $password_hash,
					'auth_provider' => $GLOBALS['cfg']['auth_providers']['raven'],
					'creation_date' => $cur_date,
					'group_id' => 2
				]);
				$stmt_atlas->execute([
					'crsid' => $member['crsid'],
					'display_name' => $member['display_name'],
					'surname' => $member['surname'],
					'role' => $member['role'],
					'college' => $member['college']
				]);
				$db->commit();
				$added_users = $added_users.$member['crsid'].",";
				$added_users_count++;
			} catch (PDOException $e) {
				if($e->getCode() == 23505) { // violated unique username constraint !?
					$db->rollBack();
				}
				fwrite($file, "[$cur_date]: {$e->getMessage()}\n");
				continue; // Move onto next user?
			}
		}

	}
}

fwrite($file, "[$cur_date]: Processed: $total_count\n");
fwrite($file, "[$cur_date]: Added: $added_users_count\n");
if($added_users_count>0)fwrite("[$cur_date]: Users added: $added_users\n");
fclose($file);
?>
