$("#user-editing").on('update', function(e, entry) {
	$(this).find(".info .title").text(entry.display_name);
	$(this).find(".info .college").text(entry.college+" ("+entry.username+")");
	$(this).find(".info .group").text(entry.group_name);
	$(this).find(".info .avatar").attr('data-jdenticon-value', entry.username);

	$("#user-editing li").each(function() {
		let last = $('#user-selection').data('last-selected');
		if(!last) return true; // continue;
		let selected = last.data('user_data');
		let group = $(this).data('group_data');
		let struct = {
			a: {
				user_id: Lib.User.State.user_id,
				access_level: Lib.User.Group.State.access_level
			},
			b: {
				user_id: selected.user_id,
				access_level: selected.access_level
			},
			g: group
		};
		let result = Lib.User.Group.CanAssign(struct);
		if(!result) {
			$(this).attr('inactive', '');
		} else {
			$(this).removeAttr('inactive');
		}
	});
});

$("#group-selection").data('current_loaded', 0);
$("#group-selection").data('search_query', '');
$("#group-selection .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#group-selection').data('search_query', $(this).val());
	$('#group-selection').data('current_loaded', 0);
	$('#group-selection .populate>ul').empty();
	$('#group-selection').trigger('load_entries');
});


$('#group-selection').on('load_entries', function(e) {
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
		$('#group-selection').data('last-selected', null);
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
				let last = $('#group-selection').data('last-selected');
				if(last)last.removeAttr("selected"); // TODO: fix this trash
				$('#group-selection').data('last-selected', $(this));

				let group_data = $('#group-selection').data('last-selected').data('group_data');
				$('#group-selection li').removeAttr('selected');
				$('#group-selection li[group_id='+entry.group_id+']').attr('selected', '');

				$('#group-users').data('group_data', group_data);
				$('#group-users').trigger('update');
				$('#group-users').trigger('clear_entries');
				$('#group-users').trigger('load_entries');

				/*Lib.Ajax.Dashboard.AssignGroup({
					user_id: selected.user_id,
					group_id: entry.group_id
				}).done(function(json) {
					console.log(json);
					switch(json.status) {
					case 'success':
						$('#user-editing li').removeAttr('selected');
						$('#user-editing li[group_id='+entry.group_id+']').attr('selected', '');

						let user_div = $('#user-selection li[user_id='+selected.user_id+']');
						let user_data = user_div.data('user_data');
						user_data.group_id = entry.group_id;
						user_data.group_name = entry.display_name;
						user_div.data('user_data', user_data);
						user_div.trigger('update');
						break;
					case 'failure_access_self_modify':
						alert('Cannot modify self');
						break;
					}
				});*/
			});
		});
		$('#group-users').data('current_loaded', count+entries.length);

	})
}).trigger('load_entries');
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
	$(this).find('.group-info .avatar').attr('data-jdenticon-value', group_data.name);
	$(this).find('.group-info .title').text(group_data.display_name);
	$(this).find('.group-info .college').text("Level: "+group_data.access_level);

	let user_data = $(this).data('user_data');

});

$('#group-users').data('current_loaded', 0);
$('#group-users').data('search_query', '');
$("#group-users .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#group-users').data('search_query', $(this).val());
	$('#group-users').data('current_loaded', 0);
	$("#group-users .populate>ul").empty();
	$('#group-users').trigger('load_entries');
});
$('#group-users').on('clear_entries', function() {
	$(this).find('.populate>ul').empty();
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
		 $('#group-users').data('last-selected', null);
		let count = $('#user-selection').data('current_loaded');
		entries.map(function(entry) {
			let div = $("#template-user-selection-item").clone().show();
			div.removeAttr('id');
			div.attr('user_id', entry.user_id);
			div.data('user_data', entry);

			div.find(".title").text(entry.display_name);
			div.find(".college").text(entry.college+" ("+entry.username+")");
			div.find(".group").text(entry.group_name);
			div.find(".avatar").attr('data-jdenticon-value', entry.username);


			div.appendTo("#group-users .populate>ul");
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