$(function() {
	setTimeout(function() {
		$("#global-loader").fadeOut(500);
	}, 500);

	$(window).on('token_validate', function() {
		Lib.Ajax.Session.TokenValidate().done(function(json) {
			console.log("[DEBUG] Processed session_token: "+Cookies.get("session_token"));
			switch(json.type) {
			case "success":
				$(window).trigger('session_created', json);
				break;
			default:
				$(window).trigger('session_destroyed', json);	
				break;
			}
		});
	}).trigger('token_validate');

	$(window).on('atlas_validate', function() {
		console.log("[DEBUG] Querying Atlas with session_token");
		Lib.Ajax.Atlas.Fetch().done(function(json) {
			switch(json.type) {
			case "success":
				$(window).trigger('atlas_success', json);
				break;
			default:
				$(window).trigger('atlas_failure', json);	
				break;
			}
		});
	});

	$(window).on('session_created', function(e, data) {
		console.log("[DEBUG] Logged in as: "+data.username);
		console.log("[DEBUG] With user_id: "+data.user_id);
		$(window).trigger('atlas_validate');
	});

	$(window).on('session_destroyed', function() {
		console.log("[DEBUG] Session token invalid");
		console.log("[DEBUG] NO LOGIN");
	});

	$(window).on('atlas_success', function(e, data) {
		console.log("[DEBUG] Atlas has responded: ");
		console.log("[DEBUG] With display_name: "+data.display_name);
		console.log("[DEBUG] With college: "+data.college);
	});

	$(window).on('atlas_failure', function() {

	});
});
