window.jdenticon_config = {
	replaceMode: "observe"
};

PAGE_CONFIGURATION = [
	{
		'path': "/",
		'handler': 'page-content-body',
		'file': 'content.html'
	},
	{
		'path': '/dashboard',
		'handler': 'nav-content-body',
		'file': 'nav-content.html'
	}
];

$(function() {
	setTimeout(function() {
		$("#global-loader").fadeOut(500);
	}, 500);

	Lib.User.Init();
	$(window).trigger('user_token_validate');

	$(window).on('user_session_created', function(e, data) {
		console.log("[DEBUG] Logged in as: "+data.username);
		console.log("[DEBUG] With user_id: "+data.user_id);
	});

	$(window).on('user_session_destroyed', function() {
		console.log("[DEBUG] Session token invalid");
		console.log("[DEBUG] NO LOGIN");
	});

	$(window).on('user_group_success', function(e, data) {
		console.log("[DEBUG] Group manager has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with access_level: "+data.access_level);
	});

	$(window).on('user_group_failure', function() {
		console.log("[DEBUG] Group manager failed to find your assigned groupid");
	});

	$(window).on('user_atlas_success', function(e, data) {
		console.log("[DEBUG] Atlas has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with college: "+data.college);
	});

	$(window).on('user_atlas_failure', function() {
		console.log("[DEBUG] Atlas has failed to find your crsid");
	});
});
