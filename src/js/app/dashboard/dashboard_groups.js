if(!Lib)var Lib = {};
if(!Lib.Dashboard)Lib.Dashboard={};
if(!Lib.Dashboard.UI)Lib.Dashboard.UI={};
Object.assign(Lib.Dashboard.UI, {
	Groups: {
		State: {},
		Init: function(options) {
			Lib.Dashboard.UI.Users.State = {options: options};
			var self = Lib.Dashboard.UI.Groups;
			self.SelectionInit(options);
			self.UserInit(options);
			self.Modals.Init(options);

			$('.group-options>.add').on('click', function() {
				options.modals.user_add.dialog('open');
			});

			options.group_selection.trigger('load_entries', function() {
				setTimeout(function() {options.group_selection.find(".populate ul li").first().trigger('click');}, 100);
			});
		},
		SelectionInit: function(options) {
			var el_selection = options.group_selection;
			var el_users = options.group_user_selection;

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
				var div = options.templates.user_selection.clone().show();
				div.removeAttr('id');
				div.data('group_data', entry);
				div.attr('group_id', entry.group_id);
				div.find(".title").text(entry.display_name);
				div.find(".college").text("Level: "+entry.access_level);
				div.find(".avatar").jdenticon(entry.name);

				div.appendTo(el_selection.find('.populate>ul'));

				div.on('click', function() {
					var last = el_selection.data('last_selected');
					if(last)last.removeAttr("selected"); // TODO: fix this trash
					el_selection.data('last_selected', $(this));

					var group_data = $(this).data('group_data');
					el_selection.find('li').removeAttr('selected');
					div.attr('selected', '');

					el_users.data('group_data', group_data);
					el_users.trigger('update');
					el_users.trigger('clear_entries', function() {
						$(this).trigger('load_entries');
					});
				});
			});

			el_selection.data('lock_load', false);
			el_selection.on('load_entries', function(e, cb) {
				if(el_selection.data('lock_load'))return;
				el_selection.data('lock_load', true);
				
				Lib.Ajax.Dashboard.QueryGroups({
					search_query: el_selection.data('search_query'),
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
		UserInit: function(options) {
			var el_selection = options.group_selection;
			var el_users = options.group_user_selection;

			el_users.data('search_query', '');
			el_users.find(".search>input").on('keyup', function(e) {
				if(e.keyCode !== 13) return;
				el_users.data('search_query', $(this).val());
				el_users.find(".populate>ul").empty();
				el_users.trigger('clear_entries', function() {
					$(this).trigger('load_entries');
				});
			});
			el_users.on('clear_entries', function(e, cb) {
				$(this).find('.populate>ul').empty();
				if(cb)cb.bind(this)();
			});

			

			el_users.on('load_entry', function(e, entry) {
				var div = options.templates.group_users.clone().show();
				div.removeAttr('id');
				div.attr('user_id', entry.user_id);
				div.data('user_data', entry);

				div.find(".title").text(entry.display_name+" ("+entry.username+")");
				div.find(".college").text(entry.college);
				//div.find(".group").text(entry.group_name);
				div.find(".avatar").jdenticon(entry.username);

				Lib.User.Group.CanEdit({
					a: {
						user_id: Lib.User.State.user_id,
						access_level: Lib.User.Group.State.access_level
					},
					b: {
						user_id: -1,
						access_level: entry.access_level
					}
				}) ? div.find('.group-options').show() : div.find('.group-options').hide();

				div.appendTo(el_users.find('.populate>ul'));

				div.find(".switch").on('click', function() {
					var modal_ga = options.modals.group_assign;
					modal_ga.data('user_data', entry);
					modal_ga.dialog('open');
				});
			});

			el_users.data('lock_load', false);
			el_users.on('load_entries', function(e) {
				if(el_users.data('lock_load'))return;
				el_users.data('lock_load', true);

				Lib.Ajax.Dashboard.QueryUsers({
					search_query: el_users.data('search_query'),
					group_id: el_users.data('group_data').group_id,
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
					entries.map(function(entry) {
						el_users.trigger('load_entry', entry);
					});
					el_users.data('lock_load', false);
				});
			});

			el_users.on('update', function() {
				var group_data = $(this).data('group_data');
				el_users.find('.group-info .avatar').jdenticon(group_data.name);
				el_users.find('.group-info .title').text(group_data.display_name);
				el_users.find('.group-info .college').text("Level: "+group_data.access_level);

				var result = Lib.User.Group.CanEdit({
					a: {
						user_id: Lib.User.State.user_id,
						access_level: Lib.User.Group.State.access_level
					},
					b: {
						user_id: -1,
						access_level: group_data.access_level
					}
				});
				result ? el_users.find('.group-options').show() : el_users.find('.group-options').hide();
			});

			el_users.find('.populate').on('scroll', function() {
				var th = $(this).find('ul').height();
				var vh = $(this).height();
				var s = $(this).scrollTop();
				var f = s/(th-vh);
				if(f > 0.95) { // check browser support ?!?!?
					el_users.trigger('load_entries');
				}
			});
		},
		Modals: {
			Init: function(options) {
				var self = Lib.Dashboard.UI.Groups.Modals;
				for(var i in options.modals) {
					options.modals[i] = options.modals[i].clone();
					options.modals[i].attr('id', '');
					options.modals[i].appendTo($('html'));
				}
				self.UserAddInit(options);
				self.GroupAssignInit(options);
			},
			UserAddInit: function(options) {
				var modal_ua = options.modals.user_add;
				modal_ua.data('selected_users', {});

				modal_ua.data('search_query', '');
				modal_ua.find(".search>input").on('keyup', function(e) {
					if(e.keyCode !== 13) return;
					modal_ua.data('search_query', $(this).val());
					modal_ua.trigger('clear_entries', function() {
						$(this).trigger('load_entries');
					});
				});
				modal_ua.on('clear_entries', function(e, cb) {
					$(this).find('.populate>ul').empty();
					if(cb)cb.bind(this)();
				});

				modal_ua.data('lock_load', false);
				modal_ua.on('load_entries', function(e) {
					if(modal_ua.data('lock_load'))return;
					modal_ua.data('lock_load', true);

					Lib.Ajax.Dashboard.QueryUsers({
						search_query: $(this).data('search_query'),
						group_id: -1,
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
						entries.map(function(entry) {
							modal_ua.trigger('populate', entry);
						});
					});
					modal_ua.data('lock_load', false);
				});
				modal_ua.on('load_selected', function() {
					var selected = modal_ua.data('selected_users');
					for(var uid in selected) {
						var entry = selected[uid];
						modal_ua.trigger('populate', entry);
					}
				});
				modal_ua.on('populate', function(e, entry) {
					var div = options.templates.user_selection.clone().show();
					div.removeAttr('id');
					div.attr('user_id', entry.user_id);
					div.data('user_data', entry);

					div.find(".title").text(entry.display_name+" ("+entry.username+")");
					div.find(".college").text(entry.college);
					div.find(".group").text(entry.group_name);
					div.find(".avatar").jdenticon(entry.username);

					div.appendTo(modal_ua.find('.populate>ul'));

					var selected_group = options.group_selection.data('last_selected').data('group_data');
					var result = Lib.User.Group.CanAssign({
						a: {
							user_id: Lib.User.State.user_id,
							access_level: Lib.User.Group.State.access_level
						},
						b: {
							user_id: entry.user_id,
							access_level: entry.access_level
						},
						g: {
							access_level: selected_group.access_level
						}
					});
					if(!result) {
						div.attr('inactive', '');
					} else {
						div.removeAttr('inactive');
						(entry.user_id in modal_ua.data('selected_users')) ?
						div.attr('selected', '') : div.removeAttr('selected');
						div.on('click', function() {
							if(entry.user_id in modal_ua.data('selected_users')) {
								var selected = modal_ua.data('selected_users');
								selected[entry.user_id] = null;
								delete selected[entry.user_id];
								modal_ua.data('selected_users', selected);
								div.removeAttr('selected');
							} else {
								var selected = modal_ua.data('selected_users');
								selected[entry.user_id] = entry;
								modal_ua.data('selected_users', selected);
								div.attr('selected', '');
							}
						});
					}
				});

				modal_ua.find('.populate').on('scroll', function() {
					var th = $(this).find('ul').height();
					var vh = $(this).height();
					var s = $(this).scrollTop();
					var f = s/(th-vh);
					if(f > 0.95) { // check browser support ?!?!?
						modal_ua.trigger('load_entries');
					}
				});


				modal_ua.dialog({
					autoOpen: false,
					modal: true,
					width: 480,
					buttons: {
						"Accept": function() {
							modal_ua.dialog("close");
							var selected = modal_ua.data('selected_users');
							if(!selected)return;
							var uids = Object.keys(selected);
							for(var i=0; i<uids.length; i++){
								var uid = uids[i];
								var group_data = options.group_selection.data('last_selected').data('group_data');
								Lib.Ajax.Dashboard.GroupAssign({
									user_id: uid,
									group_id: group_data.group_id
								}).done(function(json) {
									if(json.status == "success") {
										options.group_user_selection.trigger('clear_entries', function() {
											$(this).trigger('load_entries');
										});
									} else {
										console.log(json);
									}
								});
							}
						},
						"Review": function() {
							modal_ua.trigger('clear_entries', function() {
								$(this).trigger('load_selected');
							});
						},
						Cancel: function() {
							modal_ua.dialog("close");
						}
					},
					close: function() {},
					open: function(e, ui) {
						modal_ua.data('selected_users', {});
						modal_ua.data('search_query', '');
						modal_ua.find('.search>input').val('');
						modal_ua.trigger('clear_entries', function() {
							$(this).trigger('load_entries');
						});
					}
				});
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
							var user = modal_ga.data('user_data');
							Lib.Ajax.Dashboard.GroupAssign({
								user_id: user.user_id,
								group_id: group_data.group_id
							}).done(function(json) {
								if(json.status == "success") {
									var selected = options.group_selection.data('last_selected');
									if(!selected)return;
									var group_data = selected.data('group_data');
									if(json.group_id != group_data.group_id) {
										options.group_user_selection.find("li[user_id="+user.user_id+"]").hide();
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
								var selected = options.group_selection.data('last_selected');
								if(!selected)return;
								var group_data = selected.data('group_data');
								// WOW
								setTimeout(function(){modal_ga.find('.populate li[group_id='+group_data.group_id+']').trigger('click');}, 100);
							});
						});
					}
				});
			}
		}
	}
});