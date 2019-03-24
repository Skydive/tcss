
// A jdenticon can be set by assigning an attribute to the respective svg element.
// window.jdenticon_config = {
// 	replaceMode: "observe"
// };

// FORCE SSL
// if(location.protocol != 'https:') {
// 	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
// }

if(!Lib)var Lib={};
if(!Lib.App)Lib.App={};
Object.assign(Lib.App, {
	Notify: function(data) {
		SKY.UI.Notify.Show({
			el: $('#notifyarea'),
			title: data.title,
			content: data.content,
			icon: data.icon,
			animation: 'fadeInRight',
			animationSpeed: 300,
			expandTime: 50,
			fade: {
				in: 500,
				wait: data.wait,
				out: 200
			},
			style: {
				background: '#fafafa',
				color:	'black'
			}
		});
	}
});

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
