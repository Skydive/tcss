<?php 
// Provide standardised output
class Output {
	public static $data = [];
	public static function SetNotify($key, $value) {
		Output::$data[$key] = $value;
	}
	public static function PrintOutput() {
		echo(json_encode(Output::$data, JSON_PRETTY_PRINT));
	}
}
?>