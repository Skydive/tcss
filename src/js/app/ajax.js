/*
	Ajax Object
	
	Contains the interface for communicating with the backend for user modification, and session management.
*/

//-------------------- GLOBALS --------------------
if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};

//--------------- BACKEND INTERFACE ---------------
Object.assign(Lib.Ajax, {
	ENTRY_POINT: "/php/index.php", 
	User: {
		/* Create: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_create",
				username: data.username,
				password: data.password
			}, null, "json");
		}, */
		PassChange: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_pass_change",
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
			}, null, "json");
		},
		Destroy: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_logout"
			}, null, "json").done(function(json) {
				if(json.type == "success") 
					Cookies.remove("session_token");
			});
		},
		TokenValidate: function() {		
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "user_verify"
			}, null, "json");
		}
	},
	Group: {
		Fetch: function() {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "group_fetch"
			}, null, "json");
		}
	},
	Atlas: {
		Fetch: function() {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "atlas_fetch"
			}, null, "json");
		}
	},
	Raven: {
		Redirect: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "raven_redirect",
				redirect_url: data.redirect_url
			}, null, "json");
		}
	}
});