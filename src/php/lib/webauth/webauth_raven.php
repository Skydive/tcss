<?php
// ---------------------------------------
//	Written by Khalid (Timothy) Aleem
// 	Reading bad code is annoying. Using it is even more so.
//	At least I understand how this works...
//	Thanks To:	https://github.com/cambridgeuniversity/mod_ucam_webauth/blob/master/mod_ucam_webauth.c
//	No More Of:	https://github.com/cambridgeuniversity/ucam-webauth-php/blob/master/ucam_webauth.php
//	Stripped out all of the session_cookie handling code - I am very uninterested in letting raven
//	handle sessions for me, while I am perfectly able to. This is a merely remnant of the apache module
//	where it was necessary for file access :)
// ---------------------------------------

// ---------------------------------------
// EXPLANATION OF HOW IT WORKS
//
// ---------------------------------------

// ----- CONSTANTS -----
abstract class WLSGlobal {
	const RAVEN_AUTH_URL = "raven.cam.ac.uk/auth/authenticate.html";
	// KEEP IT IN HERE FOR SECURITY
	const PUBKEY2_CRT = "-----BEGIN CERTIFICATE-----
MIIDrTCCAxagAwIBAgIBADANBgkqhkiG9w0BAQQFADCBnDELMAkGA1UEBhMCR0Ix
EDAOBgNVBAgTB0VuZ2xhbmQxEjAQBgNVBAcTCUNhbWJyaWRnZTEgMB4GA1UEChMX
VW5pdmVyc2l0eSBvZiBDYW1icmlkZ2UxKDAmBgNVBAsTH0NvbXB1dGluZyBTZXJ2
aWNlIFJhdmVuIFNlcnZpY2UxGzAZBgNVBAMTElJhdmVuIHB1YmxpYyBrZXkgMjAe
Fw0wNDA4MTAxMzM1MjNaFw0wNDA5MDkxMzM1MjNaMIGcMQswCQYDVQQGEwJHQjEQ
MA4GA1UECBMHRW5nbGFuZDESMBAGA1UEBxMJQ2FtYnJpZGdlMSAwHgYDVQQKExdV
bml2ZXJzaXR5IG9mIENhbWJyaWRnZTEoMCYGA1UECxMfQ29tcHV0aW5nIFNlcnZp
Y2UgUmF2ZW4gU2VydmljZTEbMBkGA1UEAxMSUmF2ZW4gcHVibGljIGtleSAyMIGf
MA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/9qcAW1XCSk0RfAfiulvTouMZKD4j
m99rXtMIcO2bn+3ExQpObbwWugiO8DNEffS7bzSxZqGp7U6bPdi4xfX76wgWGQ6q
Wi55OXJV0oSiqrd3aOEspKmJKuupKXONo2efAt6JkdHVH0O6O8k5LVap6w4y1W/T
/ry4QH7khRxWtQIDAQABo4H8MIH5MB0GA1UdDgQWBBRfhSRqVtJoL0IfzrSh8dv/
CNl16TCByQYDVR0jBIHBMIG+gBRfhSRqVtJoL0IfzrSh8dv/CNl16aGBoqSBnzCB
nDELMAkGA1UEBhMCR0IxEDAOBgNVBAgTB0VuZ2xhbmQxEjAQBgNVBAcTCUNhbWJy
aWRnZTEgMB4GA1UEChMXVW5pdmVyc2l0eSBvZiBDYW1icmlkZ2UxKDAmBgNVBAsT
H0NvbXB1dGluZyBTZXJ2aWNlIFJhdmVuIFNlcnZpY2UxGzAZBgNVBAMTElJhdmVu
IHB1YmxpYyBrZXkgMoIBADAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBBAUAA4GB
AFciErbr6zl5i7ClrpXKA2O2lDzvHTFM8A3rumiOeauckbngNqIBiCRemYapZzGc
W7fgOEEsI4FoLOjQbJgIrgdYR2NIJh6pKKEf+9Ts2q/fuWv2xOLw7w29PIICeFIF
hAM+a6/30F5fdkWpE1smPyrfASyXRfWE4Ccn1RVgYX9u
-----END CERTIFICATE-----
";
	const CLOCK_SKEW = 5;
	// Increase if latency exists??? (1 is acceptable)
	const REQUEST_LIFETIME = 1;
};

// Oh no, enums
abstract class EWLSToken {
	const VERSION	= 0;
	const STATUS 	= 1; // (default 200)
	const MESSAGE	= 2;
	const ISSUE		= 3;
	const ID 		= 4;
	const URL 		= 5;
	const PRINCIPAL	= 6;
	const PTAGS		= 7; // current (all cases)
	const AUTH		= 8; // (blank)
	const SSO		= 9; // pwd
	const LIFE		= 10; // (30408 max) - ignored as we do session management ourselves
	const PARAMS	= 11;
	const KEYID		= 12; // 2 (all cases) - ignored as crt is within file
	const SIGNATURE	= 13; // (IMPORTANT) - RSA verification
}

class WLSException extends Exception {
	const UNKNOWN_ERROR = 'An unknown error has occured. This is not ideal';
	// Why are we using a deprecated model like error codes?
	// Perhaps it is a good idea to pay homage to the classical apache code,
	// especially when in reality most of these errors will NEVER occur
	const ERROR_MESSAGES = [
		'200' => 'OK',
		'410' => 'Authentication cancelled at user\'s request',
		'510' => 'No mutually acceptable types of authentication available',
		'520' => 'Unsupported authentication protocol version',
		'530' => 'Parameter error in authentication request',
		'540' => 'Interaction with the user would be required',
		'550' => 'Web server and authentication server clocks out of sync',
		'560' => 'Web server not authorized to use the authentication service',
		'570' => 'Operation declined by the authentication service',
		'1337' => 'Oh wow it appears that I actually know what I\'m doing - invalid wls response',
		'1338' => 'Oh wow it appears that I actually know what I\'m doing - wls response expired'
	];
    public function __construct($data) {
    	$code = $data['code'];
    	$message = array_key_exists('message', $data) ? $data['message'] : '';
    	$log = array_key_exists('log', $data) ? $data['log'] : '';

    	if(isset($log)) {
    		if($log) {
		    	error_log($log);
    		}
    	}

    	if(is_numeric($code)) {
    		$code = intval($code);
    	} else {
    		$code = 0;
    	}
    	$strcode = "$code";

    	if(!$message) {
    		if(!array_key_exists($strcode, WLSException::ERROR_MESSAGES)) {
				// Unknown status
				parent::__construct(WLSException::UNKNOWN_ERROR, 0);
				return;
			}
			parent::__construct(WLSException::ERROR_MESSAGES[$strcode], $code);
			return;
    	}
    	parent::__construct($message, $code);
    }
}


class WLSToken {
	const SIG_BASE = [
		EWLSToken::VERSION,
		EWLSToken::STATUS,
		EWLSToken::MESSAGE,
		EWLSToken::ISSUE,
		EWLSToken::ID,
		EWLSToken::URL,
		EWLSToken::PRINCIPAL,
		EWLSToken::PTAGS,
		EWLSToken::AUTH,
		EWLSToken::SSO,
		EWLSToken::LIFE,
		EWLSToken::PARAMS
	];

	private static function wls_decode($str) {
		return preg_replace(array('/-/', '/\./', '/_/'), array('+', '/', '='), $str);	
	}
	private function decoded_signature() {
		return base64_decode(WLSToken::wls_decode($this->signature));
	}
	
	private function StatusCheck() {
		if(!array_key_exists($this->status, WLSException::ERROR_MESSAGES)) {
			// Unknown status
			print_r('ef');
			print_r($this->status);
			throw new WLSException([
				'code' => '0',
				'log' => $this->message
			]);
			return;
		}

		if($this->status != '200') { // General catch
			throw new WLSException([
				'code' => $this->status,
				'log' => $this->message
			]);
		}

		// ISSUE TIME...
		$result = strtotime($this->issue);
			if(!$result) {
				throw new WLSException([
				'code' => '600',
				'message' => 'cannot parse in WLS-Response',
				'log' => $this->message
			]);
		}

		$cur_time = time();
		$skew = WLSGlobal::CLOCK_SKEW; // TODO: Allow this to be set in the query...
		if($result > $cur_time+$skew) {
			throw new WLSException([
				'code' => '600',
				'message' => 'The request appears to be coming from the future...',
				'log' => $this->message
			]);
		}
		// Parse KeyID
		if(!preg_match('/\d{1,8}$/', $this->keyid)) {
			throw new WLSException([
				'code' => '600',
				'message' => 'Invalid key ID',
				'log' => $this->message
			]);
		}
	}
	public function __construct($raw) {
		$this->raw = $raw;
		$this->parts = explode('!', $this->raw);

		$this->version	= $this->parts[EWLSToken::VERSION];
		$this->status	= $this->parts[EWLSToken::STATUS];
		$this->message	= $this->parts[EWLSToken::MESSAGE];
		$this->issue	= $this->parts[EWLSToken::ISSUE];
		$this->id		= $this->parts[EWLSToken::ID];
		$this->url		= $this->parts[EWLSToken::URL];
		$this->principal= $this->parts[EWLSToken::PRINCIPAL];
		$this->ptags	= $this->parts[EWLSToken::PTAGS];
		$this->auth		= $this->parts[EWLSToken::AUTH];
		$this->sso		= $this->parts[EWLSToken::SSO];
		$this->life		= $this->parts[EWLSToken::LIFE];
		$this->params	= $this->parts[EWLSToken::PARAMS];
		$this->keyid	= $this->parts[EWLSToken::KEYID];
		$this->signature= $this->parts[EWLSToken::SIGNATURE];

		//implode('!', array_splice($this->parts, EWLSToken::VERSION, EWLSToken::PARAMS+1-EWLSToken::VERSION));
		// OR THIS WHERE WE SPECIFY EACH COMPONENT AND JOIN - EASIER TO UNDERSTAND LIKE THE C VERSION
		$this->data = self::SIG_BASE;
		array_walk($this->data, function(&$x) { 
			$x = $this->parts[$x];
		});
		$this->data = implode('!', $this->data);

		// print_r(json_encode($this, JSON_PRETTY_PRINT));
		// foreach($this as $k => $v) {
		// 	echo("<code>\t$k => $v</code>");
		// }

		$this->StatusCheck();
	}
	public function Authenticate() {
		$pub_key = openssl_get_publickey(WLSGlobal::PUBKEY2_CRT);
		$result = openssl_verify($this->data, $this->decoded_signature(), $pub_key, OPENSSL_ALGO_SHA1);
		if($result) {
			// DURATION -- VERY IMPORTANT FOR SECURITY
			// Prevent session hijacking
			$cur_time = time();
			$issue_time = strtotime($this->issue);
			$expiry_time = $issue_time+WLSGlobal::REQUEST_LIFETIME;
			if($cur_time > $expiry_time) {
				throw new WLSException([
					'code' => '1338'
				]);
			}
		}
		return $result;
	}
}

class WebAuth {
	private static function GenerateUniqueInteger() {
		return str_pad(crc32(uniqid(rand(100000,999999),true)), 10, '0', STR_PAD_RIGHT).rand(100000,999999);
	}
	public static function GenerateURL($data) {
		$raven_auth_url = WLSGlobal::RAVEN_AUTH_URL;
		$hostname = $data['url'];
	
		if(!array_key_exists('params', $data)) {
			$data['params'] = [];
		}		
		// Extra protection for signature generation
		$data['params']['salt'] = WebAuth::GenerateUniqueInteger();

		$query_data = [
			'ver' => array_key_exists('ver', $data) ? $data['ver'] : '3',
			'url' => $hostname,
			'params' => base64_encode(json_encode($data['params']))
		];
		$query = http_build_query($query_data);
		$redirect = "https://$raven_auth_url?$query";
		return $redirect;
	}
	public static function TokenValidate($data) {
		$token = new WLSToken($data['token_raw']);

		$result = $token->Authenticate();
		if($result) {
			return [
				'token' => $token,
				'params' => json_decode(base64_decode($token->params), true)
			];
		}

		throw new WLSException([
			'code' => '1337'
		]);
	}
}

//FOR TESTING PURPOSES
// Generate my own 
/*
var_dump(WebAuth::GenerateURL([
 	'url' => 'dev.precess.io'
]));

$REDIRECT_URL = "https://dev.precess.io/?WLS-Response=3!200!!20180907T044319Z!kI54FA6.7Tsb9RhZeFBrpFUs!https%3A%2F%2Fdev.precess.io!ka476!current!!pwd!7638!eyJzYWx0IjoiMTU1MTgxNDI2MTI3MDgyNSJ9!2!SX26m.4FCwEQg8TLLSp-eeQFuuCOQPgOp0y6Q43f7NsJ0C6jFy7dLShIsBpL2iyJDss5mCIPUpzz.6ucme8S2sEes2UjC5kw23dARL7g7nSuOzuFiAgcnlyCSjLSbHWNp7nuAinGSu-J2l0bmjtY9dt5DZZ4FbPCr1DOpNqRQNs_";
$token_raw = rawurldecode(parse_url($REDIRECT_URL, PHP_URL_QUERY));
$token_raw = preg_replace('/^WLS-Response=/', '', $token_raw);
var_dump(WebAuth::TokenValidate([
	'token_raw' => $token_raw
]));*/
?>
