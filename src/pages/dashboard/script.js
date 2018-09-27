$("#group-selection").data('current_loaded', 0);
$("#group-selection").data('search_query', '');
$("#group-selection .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#group-selection').data('search_query', $(this).val());
	$('#group-selection').data('current_loaded', 0);
	$('#group-selection .populate>ul').empty();
	$('#group-selection').trigger('clear_entries', function() {
		$(this).trigger('load_entries');
	});
});

$('#group-selection').on('clear_entries', function(e, cb) {
	$(this).find('.populate>ul').empty();
	$('#group-selection').data('current_loaded', 0);
	if(cb)cb.bind(this)();
});
$('#group-selection').on('load_entries', function(e, cb) {
	Lib.Ajax.Dashboard.QueryGroups({
		search_query: $('#group-selection').data('search_query'),
		index: $('#group-selection').data('current_loaded'),
		count: 50
	}).done(function(json) {
		if(json.status !== 'success') {
			if(json.type === "failure_session_token_invalid") {
				alert("You're not authenticated :(");
				window.location.href = '/login';
			}
			return;
		}
		let entries = json.out;
		$('#group-selection').data('last_selected', null);
		let count = $('#group-selection').data('current_loaded');
		entries.map(function(entry) {
			let div = $("#template-user-selection-item").clone().show();
			div.removeAttr('id');
			div.data('group_data', entry);
			div.attr('group_id', entry.group_id);
			div.find(".title").text(entry.display_name);
			div.find(".college").text("Level: "+entry.access_level);
			div.find(".avatar").attr('data-jdenticon-value', entry.name);

			div.appendTo("#group-selection .populate>ul");

			div.on('click', function() {
				let last = $('#group-selection').data('last_selected');
				if(last)last.removeAttr("selected"); // TODO: fix this trash
				$('#group-selection').data('last_selected', $(this));

				let group_data = $('#group-selection').data('last_selected').data('group_data');
				$('#group-selection li').removeAttr('selected');
				div.attr('selected', '');

				$('#group-users').data('group_data', group_data);
				$('#group-users').trigger('update');
				$('#group-users').trigger('clear_entries', function() {
					$(this).trigger('load_entries');
				});
			});
		});
		$('#group-selection').data('current_loaded', count+entries.length);

	});
	if(cb)cb.bind(this)();
});
$('#group-selection .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#group-selection').trigger('load_entries');
	}
});

$('#group-users').on('update', function() {
	let group_data = $(this).data('group_data');
	$('.group-info .avatar').attr('data-jdenticon-value', group_data.name);
	$('.group-info .title').text(group_data.display_name);
	$('.group-info .college').text("Level: "+group_data.access_level);

	let result = Lib.User.Group.CanEdit({
		a: {
			user_id: Lib.User.State.user_id,
			access_level: Lib.User.Group.State.access_level
		},
		b: {
			user_id: -1,
			access_level: group_data.access_level
		}
	});

	result ? $('.group-options').show() : $('.group-options').hide();
});

$('#group-users').data('current_loaded', 0);
$('#group-users').data('search_query', '');
$("#group-users .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#group-users').data('search_query', $(this).val());
	$('#group-users').data('current_loaded', 0);
	$("#group-users .populate>ul").empty();
	$('#group-users').trigger('clear_entries', function() {
		$(this).trigger('load_entries');
	});
});
$('#group-users').on('clear_entries', function(e, cb) {
	$(this).find('.populate>ul').empty();
	$('#group-users').data('current_loaded', 0);
	if(cb)cb.bind(this)();
});
$('#group-users').on('load_entries', function(e) {
	Lib.Ajax.Dashboard.QueryUsers({
		search_query: $('#group-users').data('search_query'),
		group_id: $('#group-users').data('group_data').group_id,
		index: $('#group-users').data('current_loaded'),
		count: 10
	}).done(function(json) {
		if(json.status !== 'success') {
			if(json.type === "failure_session_token_invalid") {
				alert("You're not authenticated :(");
				window.location.href = '/login';
			}
			return;
		}
		let entries = json.out;
		let count = $('#group-users').data('current_loaded');
		entries.map(function(entry) {
			let div = $("#template-group-users-item").clone().show();
			div.removeAttr('id');
			div.attr('user_id', entry.user_id);
			div.data('user_data', entry);

			div.find(".title").text(entry.display_name+" ("+entry.username+")");
			div.find(".college").text(entry.college);
			//div.find(".group").text(entry.group_name);
			div.find(".avatar").attr('data-jdenticon-value', entry.username);

			div.appendTo("#group-users .populate>ul");

			div.find(".switch").on('click', function() {
				$("#modal-group-assign").data('user_data', entry);
				$("#modal-group-assign").dialog('open');
			});
		});
		$('#group-users').data('current_loaded', count+entries.length);
	});
});
$('#group-users .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#group-users').trigger('load_entries');
	}
});

$("#modal-user-add").dialog({
	autoOpen: false,
	modal: true,
	width: 480,
	buttons: {
		"Accept": function() {
			$("#modal-user-add").dialog("close");
			let selected = $("#modal-user-add").data('selected_users');
			if(!selected)return;
			let uids = Object.keys(selected);
			for(let i=0; i<uids.length; i++){
				let uid = uids[i];
				let group_data = $('#group-selection').data('last_selected').data('group_data');
				Lib.Ajax.Dashboard.GroupAssign({
					user_id: uid,
					group_id: group_data.group_id
				}).done(function(json) {
					if(json.status == "success") {
						$('#group-users').trigger('clear_entries', function() {
							$(this).trigger('load_entries');
						});
					} else {
						console.log(json);
					}
				});
			}
		},
		"Review": function() {
			$("#modal-user-add").trigger('clear_entries', function() {
				$(this).trigger('load_selected');
			});
		},
		Cancel: function() {
			$("#modal-user-add").dialog("close");
		}
	},
	close: function() {},
	open: function(e, ui) {
		$("#modal-user-add").data('selected_users', {});
		$("#modal-user-add").data('search_query', '');
		$("#modal-user-add .search>input").val('');
		$('#modal-user-add').trigger('clear_entries', function() {
			$(this).trigger('load_entries');
		});
	}
});

$("#modal-user-add").data('selected_users', {});

$("#modal-user-add").data('current_loaded', 0);
$("#modal-user-add").data('search_query', '');
$("#modal-user-add .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#modal-user-add').data('search_query', $(this).val());
	$('#modal-user-add').trigger('clear_entries', function() {
		$(this).trigger('load_entries');
	});
});
$('#modal-user-add').on('clear_entries', function(e, cb) {
	$(this).find('.populate>ul').empty();
	$(this).data('current_loaded', 0);
	if(cb)cb.bind(this)();
});
$('#modal-user-add').on('load_entries', function(e) {
	Lib.Ajax.Dashboard.QueryUsers({
		search_query: $(this).data('search_query'),
		group_id: -1,
		index: $(this).data('current_loaded'),
		count: 10
	}).done(function(json) {
		if(json.status !== 'success') {
			if(json.type === "failure_session_token_invalid") {
				alert("You're not authenticated :(");
				window.location.href = '/login';
			}
			return;
		}
		let entries = json.out;
		let count = $('#modal-user-add').data('current_loaded');
		entries.map(function(entry) {
			$('#modal-user-add').trigger('populate', entry);
		});
		$('#modal-user-add').data('current_loaded', count+entries.length);
	});
});
$('#modal-user-add').on('load_selected', function() {
	let selected = $('#modal-user-add').data('selected_users');
	for(let uid in selected) {
		let entry = selected[uid];
		$('#modal-user-add').trigger('populate', entry);
	}
});
$('#modal-user-add').on('populate', function(e, entry) {
	let div = $("#template-user-selection-item").clone().show();
	div.removeAttr('id');
	div.attr('user_id', entry.user_id);
	div.data('user_data', entry);

	div.find(".title").text(entry.display_name+" ("+entry.username+")");
	div.find(".college").text(entry.college);
	div.find(".group").text(entry.group_name);
	div.find(".avatar").attr('data-jdenticon-value', entry.username);

	div.appendTo("#modal-user-add .populate>ul");

	let selected_group = $('#group-selection').data('last_selected').data('group_data');
	let result = Lib.User.Group.CanAssign({
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
		(entry.user_id in $('#modal-user-add').data('selected_users')) ?
		div.attr('selected', '') : div.removeAttr('selected');
		div.on('click', function() {
			if(entry.user_id in $('#modal-user-add').data('selected_users')) {
				let selected = $('#modal-user-add').data('selected_users');
				selected[entry.user_id] = null;
				delete selected[entry.user_id];
				$('#modal-user-add').data('selected_users', selected);
				div.removeAttr('selected');
			} else {
				let selected = $('#modal-user-add').data('selected_users');
				selected[entry.user_id] = entry;
				$('#modal-user-add').data('selected_users', selected);
				div.attr('selected', '');
			}
		});
	}
});

$('#modal-user-add .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#modal-user-add').trigger('load_entries');
	}
});

$('.group-options>.add').on('click', function() {
	$('#modal-user-add').dialog('open');
});


$("#modal-group-assign").dialog({
	autoOpen: false,
	modal: true,
	width: 480,
	buttons: {
		"Accept": function() {
			$("#modal-group-assign").dialog("close");
			let selected = $('#modal-group-assign').data('last_selected');
			if(!selected)return;
			let group_data = selected.data('group_data');
			let user = $("#modal-group-assign").data('user_data');
			Lib.Ajax.Dashboard.GroupAssign({
				user_id: user.user_id,
				group_id: group_data.group_id
			}).done(function(json) {
				if(json.status == "success") {
					let selected = $('#group-selection').data('last_selected');
					if(!selected)return;
					let group_data = selected.data('group_data');
					if(json.group_id != group_data.group_id) {
						$("#group-users li[user_id="+user.user_id+"]").hide();
					}
				} else {
					console.log(json);
				}
			});
		},
		Cancel: function() {
			$("#modal-group-assign").dialog("close");
		}
	},
	close: function() {},
	open: function(e, ui) {
		let entry = $("#modal-group-assign").data('user_data');
		$("#modal-group-assign .title").text(entry.display_name+" ("+entry.username+")");
		$("#modal-group-assign .college").text(entry.college);
		$("#modal-group-assign .avatar").attr('data-jdenticon-value', entry.username);

		$("#modal-group-assign .search>input").val('');
		$("#modal-user-add").data('search_query', '');
		$('#modal-group-assign').trigger('clear_entries', function() {
			$(this).trigger('load_entries', function() {
				let selected = $('#group-selection').data('last_selected');
				if(!selected)return;
				let group_data = selected.data('group_data');
				// WOW
				setTimeout(() => $('#modal-group-assign .populate li[group_id='+group_data.group_id+']').trigger('click'), 100);
			});
		});
	}
});

$("#modal-group-assign").data('current_loaded', 0);
$("#modal-group-assign").data('search_query', '');
$("#modal-group-assign .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#modal-group-assign').data('search_query', $(this).val());
	$('#modal-group-assign').trigger('clear_entries', function() {
		$(this).trigger('load_entries');
	});
});
$('#modal-group-assign').on('clear_entries', function(e, cb) {
	$(this).find('.populate>ul').empty();
	$(this).data('current_loaded', 0);
	if(cb)cb.bind(this)();
});
$('#modal-group-assign').on('load_entries', function(e, cb) {
	Lib.Ajax.Dashboard.QueryGroups({
		search_query: $('#modal-group-assign').data('search_query'),
		index: $('#modal-group-assign').data('current_loaded'),
		count: 50
	}).done(function(json) {
		if(json.status !== 'success') {
			if(json.type === "failure_session_token_invalid") {
				alert("You're not authenticated :(");
				window.location.href = '/login';
			}
			return;
		}
		let entries = json.out;
		let count = $('#modal-group-assign').data('current_loaded');
		$('#modal-group-assign').data('last_selected', null);
		entries.map(function(entry) {
			$('#modal-group-assign').trigger('populate', entry);
		});
		$('#modal-group-assign').data('current_loaded', count+entries.length);
	});
	if(cb)cb.bind(this)();
});
$('#modal-group-assign').on('populate', function(e, entry) {
	let div = $("#template-user-selection-item").clone().show();
	div.removeAttr('id');
	div.data('group_data', entry);
	div.attr('group_id', entry.group_id);
	div.find(".title").text(entry.display_name);
	div.find(".college").text("Level: "+entry.access_level);
	div.find(".avatar").attr('data-jdenticon-value', entry.name);
	div.appendTo("#modal-group-assign .populate>ul");

	let selected_user = $('#modal-group-assign').data('user_data');
	let result = Lib.User.Group.CanAssign({
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
			let last = $('#modal-group-assign').data('last_selected');
			if(last)last.removeAttr("selected"); // TODO: fix this trash
			$('#modal-group-assign').data('last_selected', $(this));

			$('#modal-group-assign li').removeAttr('selected');
			div.attr('selected', '');
		});
	}
});

$('#modal-group-assign .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#modal-group-assign').trigger('load_entries');
	}
});

// TODO: Code group ADD and DELETE (for PRESIDENT/DEVELOPER USE ONLY...)
$("#modal-group-add").dialog({
	autoOpen: false,
	modal: true,
	buttons: {
		"Create group": function() {
			console.log("MEMES!");
		},
		Cancel: function() {
			$("#modal-group-add").dialog("close");
		}
	},
	close: function() {
		$("#modal-group-add>form")[0].reset();
	}
});


$("#group-selection").trigger('load_entries', function() {
	setTimeout(() => $("#group-selection .populate ul li").first().trigger('click'), 100);
});