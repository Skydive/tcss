<?php
class Security {
	public static $fallover_salts = [
		"base" => "617wvX3uA8eQVU!2&Xcn",
		"default" => "617wvX3uA8eQVUEDED"
	];
	public static function GenerateHash($options) {
		$data = $options['data'];
		
		$algo = $options['algo'] ? $options['algo'] : 'sha512';
		
		$saltname = $options['salt_id'] ? $options['salt_id'] : "default"; // anti fuckup
		
		$base_salt = $GLOBALS['hashsalts']['base'] ? $GLOBALS['hashsalts']['base'] : Security::$fallover_salts['base'];
		$salt = $GLOBALS['hashsalts'][$saltname] ? $GLOBALS['hashsalts'][$saltname] : Security::$fallover_salts[$saltname];
		$extra_salt = $options['extra_salt'] ? $options['extra_salt'] : "";
		
		$hash = hash($algo,$data.$base_salt.$salt.$extra_salt);
		
		return $hash;
	}
	public static function GenerateUniqueInteger() {
		return str_pad(crc32(uniqid(rand(100000,999999),true)), 10, '0', STR_PAD_RIGHT).rand(100000,999999);
	}
}
?>
