<?php
class SKYException extends Exception {
	private static $_options;
	
	public static function Send($options) {
		throw new SKYException($options);
	}
	
	function __construct($options) {
		SKYException::$_options = $options;
	}
	
	public function __toString() {
		$options = SKYException::$_options;
		return __CLASS__ . ": {$options['type']}_{$options['error']}\n";
	}

	public static function GetOptions() {
		return SKYException::$_options;
	}

	public static function Notify() {
		$options = SKYException::$_options;
		if((DEVELOPMENT_MODE && in_array($options['type'], $GLOBALS['dev_exceptions']))
		|| in_array($options['type'], $GLOBALS['exceptions'])) {
			Output::SetNotify("type", "failure_{$options['type']}_{$options['error']}");
			return;
		}
		Output::SetNotify("type", "failure_unspecified");
	}

	public static function CheckNULL($var, $type, $error) {
		if(!$var) SKYException::Send([
			'type' => $type,
			'error' => $error
		]);
	}
}
?>