window.jdenticon_config = {
	replaceMode: "observe"
};
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

	$(window).on('session_created', function(e, data) {
		console.log("[DEBUG] Logged in as: "+data.username);
		console.log("[DEBUG] With user_id: "+data.user_id);
		$(window).trigger('group_validate');
		$(window).trigger('atlas_validate');
	});

	$(window).on('session_destroyed', function() {
		console.log("[DEBUG] Session token invalid");
		console.log("[DEBUG] NO LOGIN");
	});

	$(window).on('group_validate', function() {
		console.log("[DEBUG] Querying Atlas with session_token");
		Lib.Ajax.Group.Fetch().done(function(json) {
			switch(json.type) {
			case "success":
				$(window).trigger('group_success', json);
				break;
			default:
				$(window).trigger('group_failure', json);	
				break;
			}
		});
	});

	$(window).on('group_success', function(e, data) {
		console.log("[DEBUG] Group manager has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with access_level: "+data.access_level);
	});

	$(window).on('group_failure', function() {
		console.log("[DEBUG] Group manager failed to find your assigned groupid");
	});

	$(window).on('atlas_validate', function() {
		console.log("[DEBUG] Querying group authority with session_token");
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

	$(window).on('atlas_success', function(e, data) {
		console.log("[DEBUG] Atlas has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with college: "+data.college);
	});

	$(window).on('atlas_failure', function() {
		console.log("[DEBUG] Atlas has failed to find your crsid");
	});
});
