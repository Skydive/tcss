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

    public static function CheckNULL($var, $type, $error) {
        if(!$var) SKYException::Send([
            'type' => $type,
            'error' => $error
        ]);
    }
}
?>