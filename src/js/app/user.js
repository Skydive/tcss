if(!Lib)var Lib={};
if(!Lib.User)Lib.User={};
Object.assign(Lib.User, {
	State: {},
	PerformLogin: function(data) {
		Lib.Ajax.Session.Login({
			username: data.username,
			password: data.password
		}).done(function(json) {
			if(json.type == "success") {
				Cookies.set("session_token", json.session_token, {
					expire: 365,
					path: '/'
				});
				window.location.href = "/";
				return;
			} else {
				Lib.App.Notify({
					title: "Login failure...",
					content: "Error: "+json.type,
					wait: 2000,
					icon: 'fa fa-times'
				});
			}
		});
	},
	Init: function() {
		// TODO: Deferred event for post_validation like
		// $.when('user_token_validate user_atlas_validate user_group_validate')
		Lib.User.Group.Init();
		Lib.User.Atlas.Init();
		$(window).on('user_token_validate', function() {  // TODO: Combine User/Atlas/Group into --> RavenUser
			Lib.Ajax.Session.TokenValidate().done(function(json) {
				console.log("[DEBUG] Processed session_token: "+Cookies.get("session_token"));
				Lib.User.State = json;
				switch(json.type) {
				case "success":
					$(window).trigger('user_session_created', json);
					$(window).trigger('user_group_validate');
					$(window).trigger('user_atlas_validate');
					break;
				default:
					$(window).trigger('user_session_destroyed', json);
					break;
				}
			});
		});
		$(window).on('user_session_created', function() {
			
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
			$(window).on('user_atlas_validate', function() {
				console.log("[DEBUG] Querying group authority with session_token");
				Lib.Ajax.Atlas.Fetch().done(function(json) {
					Lib.User.Atlas.State = json;
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
		EAccessLevel: { // NOTE: This is complemented in the pre-SQL data
			DEVELOPER: 0,
			PRESIDENT: 10,
			COMMITTEE: 20,
			STUDENT: 100,
			UNASSIGNED: 255
		},
		EDIT_RANGE: [1, 100],
		Init: function() {
			$(window).on('user_group_validate', function() {
				console.log("[DEBUG] Querying Atlas with session_token");
				Lib.Ajax.Group.Fetch().done(function(json) {
					Lib.User.Group.State = json;
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
		},
		/*
			The editing of users can be broken down into two distinct stages.
			1. Can a actually edit b
				1.1. Cannot edit SELF
				1.2. Cannot edit a user of the same access level (unless a is DEVELOPER or PRESIDENT)
				1.3. Cannot edit a user of lower access level
			2. Can user a assign group g to b.
				2.1. Cannot assign if group g access level is of same as user a (unless a is DEVELOPER or PRESIDENT)
				2.3. Cannot assign if group g access level is lower than user a 
		*/
		CanEdit: function(data) {
			var a = data.a;
			var b = data.b;
			var EAccessLevel = Lib.User.Group.EAccessLevel;
			var edit_range = Lib.User.Group.EDIT_RANGE;
			// Cannot edit self
			if(a.user_id == b.user_id) return false;
			// Bounding range
			if(b.access_level < edit_range[0] || edit_range[1] < b.access_level)return false;
			// Cannot edit a user of same level, UNLESS president
			if(a.access_level == b.access_level && 
				(a.access_level != EAccessLevel.PRESIDENT))return false;
			// Cannot edit a user of lower access level
			if(a.access_level > b.access_level)return false;
			return true;
		},
		CanAssign: function(data) {
			var a = data.a;
			var b = data.b;
			var g = data.g;
			var EAccessLevel = Lib.User.Group.EAccessLevel;
			var edit_range = Lib.User.Group.EDIT_RANGE;
			if(!Lib.User.Group.CanEdit({a: a, b: b}))return false;
			if(g.access_level < edit_range[0] || edit_range[1] < g.access_level)return false;
			if(a.access_level == g.access_level && 
				(a.access_level != EAccessLevel.PRESIDENT))return false;
			if(a.access_level > g.access_level)return false;
			return true;
		}
	}
});