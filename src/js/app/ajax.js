if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	ENTRY_POINT: "/php/index.php", 
	User: {
		Create: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_create",
				username: data.username,
				password: data.password
			}, null, "json");
		}
	},
	Session: {
		Login: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_login",
				username: data.username,
				password: data.password
			}, null, "json").done(function(json) {
				if(json.type == "success") {
					Cookies.set("session_token", json.session_token, {
						domain: '.'+window.location.hostname,
						expire: 365,
						path: '/'
					});
				}
			});
		},
		Destroy: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_logout"
			}, null, "json").done(function(json) {
				if(json.type == "success") 
					Cookies.set("session_token", "SESSION_TOKEN_UNSPECIFIED", {
						domain: '.'+window.location.hostname,
						path: '/'
					});
			});
		},
		TokenValidate: function() {		
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_verify"
			}, null, "json");
		}
	},
	Atlas: {
		Fetch: function() {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "atlas_fetch"
			}, null, "json");
		}
	}
});