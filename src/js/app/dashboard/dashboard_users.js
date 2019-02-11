if(!Lib)var Lib = {};
if(!Lib.Dashboard)Lib.Dashboard={};
if(!Lib.Dashboard.UI)Lib.Dashboard.UI={};
Object.assign(Lib.Dashboard.UI, {
	Users: {
		State: {},
		Init: function(options) {
			Lib.Dashboard.UI.Users.State = {options: options};
			var self = Lib.Dashboard.UI.Users;
			self.SelectionInit(options);
			self.UserInfoInit(options);
			self.Modals.Init(options);

			$('.user-options>.add').on('click', function() {
				options.modals.user_add.dialog('open');
			});

			options.user_selection.trigger('load_entries', function() {
				setTimeout(function() {options.user_selection.find(".populate ul li").first().trigger('click');}, 100);
			});
		},
		SelectionInit: function(options) {
			var el_selection = options.user_selection;
			var el_userinfo = options.user_info;

			el_selection.data('search_query', '');
			el_selection.find(".search>input").on('keyup', function(e) {
				if(e.keyCode !== 13) return;
				el_selection.data('search_query', $(this).val());
				el_selection.find('.populate>ul').empty();
				el_selection.trigger('clear_entries', function() {
					$(this).trigger('load_entries');
				});
			});

			el_selection.on('clear_entries', function(e, cb) {
				$(this).find('.populate>ul').empty();
				if(cb)cb.bind(this)();
			});

			el_selection.on('load_entry', function(e, entry) {
				var div = options.templates.group_users.clone().show();
				div.removeAttr('id');
				div.data('user_data', entry);
				div.attr('user_id', entry.user_id);
				div.find(".title").text(entry.display_name+" ("+entry.username+")");
				div.find(".college").text(entry.college);
				div.find(".group").text(entry.group_name);
				div.find(".avatar").jdenticon(entry.username);
				div.appendTo(el_selection.find('.populate>ul'));

				var result = Lib.User.Group.CanEdit({
					a: {
						user_id: Lib.User.State.user_id,
						access_level: Lib.User.Group.State.access_level
					},
					b: {
						user_id: -1,
						access_level: entry.access_level
					}
				});

				if(!result) {
						div.attr('inactive', true);
						div.find('.group-options').hide();
				} else {
					div.removeAttr('inactive');
					div.find('.group-options').show();
					div.find(".switch").on('click', function() {
						var modal_ga = options.modals.group_assign;
						modal_ga.data('user_data', entry);
						modal_ga.dialog('open');
					});
				}

				div.on('click', function() {
					var last = el_selection.data('last_selected');
					if(last)last.removeAttr("selected"); // TODO: fix this trash
					el_selection.data('last_selected', $(this));

					var user_data = $(this).data('user_data');
					el_selection.find('li').removeAttr('selected');
					div.attr('selected', '');

					el_userinfo.data('user_data', user_data);
					el_userinfo.trigger('update');
				});
			});

			el_selection.data('lock_load', false);
			el_selection.on('load_entries', function(e, cb) {
				if(el_selection.data('lock_load'))return;
				el_selection.data('lock_load', true);
				Lib.Ajax.Dashboard.QueryUsers({
					search_query: el_selection.data('search_query'),
					group_id: -1,
					index:  $(this).find('.populate>ul').children().length,
					count: 25
				}).done(function(json) {
					if(json.status !== 'success') {
						if(json.type === "failure_session_token_invalid") {
							alert("You're not authenticated :(");
							window.location.href = '/login';
						}
						return;
					}
					var entries = json.out;
					el_selection.data('last_selected', null);
					entries.map(function(entry) {
						el_selection.trigger('load_entry', entry);
					});

					el_selection.data('lock_load', false);
				});
				if(cb)cb.bind(this)();
			});

			el_selection.find('.populate').on('scroll', function() {
				var th = $(this).find('ul').height();
				var vh = $(this).height();
				var s = $(this).scrollTop();
				var f = s/(th-vh);
				if(f > 0.95) { // check browser support ?!?!?
					el_selection.trigger('load_entries');
				}
			});
		},
		UserInfoInit: function(options) {
			var el_selection = options.user_selection;
			var el_userinfo = options.user_info;

			el_userinfo.on('update', function(e) {
				var user_data = $(this).data('user_data');
				$(this).find(".atlas-user-info .title").text(user_data.display_name);
				$(this).find(".atlas-user-info .college").text(user_data.college+" ("+user_data.username+")");
				$(this).find(".atlas-user-info .group").text(user_data.group_name);

				$(this).find(".atlas-user-info .avatar").jdenticon(user_data.username);
				//$(".atlas .avatar").jdenticon(data.crsid);
			});
		},
		Modals: {
			Init: function(options) {
				var self = Lib.Dashboard.UI.Users.Modals;
				for(var i in options.modals) {
					options.modals[i] = options.modals[i].clone();
					options.modals[i].attr('id', '');
					options.modals[i].appendTo($('html'));
				}
				self.GroupAssignInit(options);
			},
			GroupAssignInit: function(options) {
				var modal_ga = options.modals.group_assign;
				modal_ga.data('search_query', '');
				modal_ga.find('.search>input').on('keyup', function(e) {
					if(e.keyCode !== 13) return;
					modal_ga.data('search_query', $(this).val());
					modal_ga.trigger('clear_entries', function() {
						$(this).trigger('load_entries');
					});
				});
				modal_ga.on('clear_entries', function(e, cb) {
					$(this).find('.populate>ul').empty();
					if(cb)cb.bind(this)();
				});

				modal_ga.data('lock_load', false);
				modal_ga.on('load_entries', function(e, cb) {
					if(modal_ga.data('lock_load'))return;
					modal_ga.data('lock_load', true);

					Lib.Ajax.Dashboard.QueryGroups({
						search_query: modal_ga.data('search_query'),
						index: $(this).find('.populate>ul').children().length,
						count: 25
					}).done(function(json) {
						if(json.status !== 'success') {
							if(json.type === "failure_session_token_invalid") {
								alert("You're not authenticated :(");
								window.location.href = '/login';
							}
							return;
						}
						var entries = json.out;
						modal_ga.data('last_selected', null);
						entries.map(function(entry) {
							modal_ga.trigger('populate', entry);
						});
						modal_ga.data('lock_load', false);
					});
					if(cb)cb.bind(this)();
				});
				modal_ga.on('populate', function(e, entry) {
					var div = options.templates.user_selection.clone().show();
					div.removeAttr('id');
					div.data('group_data', entry);
					div.attr('group_id', entry.group_id);
					div.find(".title").text(entry.display_name);
					div.find(".college").text("Level: "+entry.access_level);
					div.find(".avatar").jdenticon(entry.name);
					div.appendTo(modal_ga.find('.populate>ul'));

					var selected_user = modal_ga.data('user_data');
					var result = Lib.User.Group.CanAssign({
						a: {
							user_id: Lib.User.State.user_id,
							access_level: Lib.User.Group.State.access_level
						},
						b: {
							user_id: selected_user.user_id,
							access_level: selected_user.access_level
						},
						g: {
							access_level: entry.access_level
						}
					});
					if(!result) {
						div.attr('inactive', true);
					} else {
						div.removeAttr('inactive');
						div.on('click', function() {
							var last = modal_ga.data('last_selected');
							if(last)last.removeAttr("selected"); // TODO: fix this trash
							modal_ga.data('last_selected', $(this));

							modal_ga.find('li').removeAttr('selected');
							div.attr('selected', '');
						});
					}
				});

				modal_ga.find('.populate').on('scroll', function() {
					var th = $(this).find('ul').height();
					var vh = $(this).height();
					var s = $(this).scrollTop();
					var f = s/(th-vh);
					if(f > 0.95) { // check browser support ?!?!?
						modal_ga.trigger('load_entries');
					}
				});

				modal_ga.dialog({
					autoOpen: false,
					modal: true,
					width: 480,
					buttons: {
						"Accept": function() {
							modal_ga.dialog("close");
							var selected = modal_ga.data('last_selected');
							if(!selected)return;
							var group_data = selected.data('group_data');
							var user_data = modal_ga.data('user_data');
							Lib.Ajax.Dashboard.GroupAssign({
								user_id: user_data.user_id,
								group_id: group_data.group_id
							}).done(function(json) {
								if(json.status == "success") {
									var selected = options.user_selection.data('last_selected');
									if(!selected)return;
									if(json.group_id != user_data.group_id) {
										options.user_selection.find("li[user_id="+user_data.user_id+"] .group").text(group_data.display_name);
										user_data.group_name = group_data.display_name;
										user_data.group_id = json.group_id;
										selected.data('user_data', user_data);
										options.user_info.data('user_data', user_data);
										options.user_info.trigger('update');
									}
								} else {
									console.log(json);
								}
							});
						},
						Cancel: function() {
							modal_ga.dialog("close");
						}
					},
					close: function() {},
					open: function(e, ui) {
						var entry = modal_ga.data('user_data');
						modal_ga.find('.title').text(entry.display_name+" ("+entry.username+")");
						modal_ga.find('.college').text(entry.college);
						modal_ga.find('.avatar').jdenticon(entry.username);

						modal_ga.find('.search>input').val('');
						modal_ga.data('search_query', '');
						modal_ga.trigger('clear_entries', function() {
							$(this).trigger('load_entries', function() {
								var selected = options.user_selection.data('last_selected');
								if(!selected)return;
								var user_data = selected.data('user_data');
								// WOW
								setTimeout(function(){modal_ga.find('.populate li[group_id='+user_data.group_id+']').trigger('click');}, 100);
							});
						});
					}
				});
			}
		}
	}
});