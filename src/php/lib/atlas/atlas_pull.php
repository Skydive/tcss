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

function GetInfo($college, $id, $f) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,"https://anonymous:@lookup-test.csx.cam.ac.uk/api/v1/inst/".$id."/members?fetch=all_attrs&format=json");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    $i = 0;
    if(isset($result->result->people)) {
        foreach($result->result->people as $p) {
            $crsid = $p->identifier->value;
            $name = isset($p->displayName) ? $p->displayName : (
                isset($p->visibleName) ? $p->visibleName : (
                    isset($p->registeredName) ? $p->registeredName : $p->surname
                    )
                );
            $surname = isset($p->surname) ? $p->surname : "";
            $role = isset($p->misAffiliation) ? $p->misAffiliation : "student";
            $i++;
            fwrite($f, $crsid.",".$name.",".$surname.",".$role.",".$college.",".$id."\n");
        }
    } else {
        print_r($id);
        print_r($result);
    }
    return $i;
}
$file = fopen("csv.txt", "a");


$i = 0;
foreach($college as $name => $arr) {
    foreach($arr as $id) {
        $i += GetInfo($name, $id, $file);
    }
}

fclose($file);

print_r("Well: ".$i." Yeah");
?>
