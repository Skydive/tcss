if(!Lib)var Lib={};
if(!Lib.User)Lib.User={};
Object.assign(Lib.User, {
	State: {},
	Init: function() {
		let self = Lib.User.State;
		// TODO: Deferred event for post_validation like
		// $.when('user_token_validate user_atlas_validate user_group_validate')
		Lib.User.Group.Init();
		Lib.User.Atlas.Init();
		$(window).on('user_token_validate', function() {  // TODO: Combine User/Atlas/Group into --> RavenUser
			Lib.Ajax.Session.TokenValidate().done(function(json) {
				console.log("[DEBUG] Processed session_token: "+Cookies.get("session_token"));
				self = json;
				switch(json.type) {
				case "success":
					$(window).trigger('user_session_created', json);
					break;
				default:
					$(window).trigger('user_session_destroyed', json);
					break;
				}
			});
		});
		$(window).on('user_session_created', function() {
			$(window).trigger('user_group_validate');
			$(window).trigger('user_atlas_validate');
		});
		$(window).on('user_session_destroyed', function() {

		});
		$(window).on('user_page_switch', function() {
			$(window).trigger('user_token_validate'); // TODO: cache this
		});
	},
	Atlas: {
		State: {},
		Init: function() { 
			let self = Lib.User.Atlas.State;
			$(window).on('user_atlas_validate', function() {
				console.log("[DEBUG] Querying group authority with session_token");
				Lib.Ajax.Atlas.Fetch().done(function(json) {
					self = json;
					switch(json.type) {
					case "success":
						$(window).trigger('user_atlas_success', json);
						break;
					default:
						$(window).trigger('user_atlas_failure', json);	
						break;
					}
				});
			});
		}
	},
	Group: {
		State: {},
		Init: function() {
			let self = Lib.User.Group.State;
			$(window).on('user_group_validate', function() {
				console.log("[DEBUG] Querying Atlas with session_token");
				Lib.Ajax.Group.Fetch().done(function(json) {
					self = json;
					switch(json.type) {
					case "success":
						$(window).trigger('user_group_success', json);
						break;
					default:
						$(window).trigger('user_group_failure', json);	
						break;
					}
				});
			});
		}
	}
});