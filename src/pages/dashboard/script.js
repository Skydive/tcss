$('#user-selection').data('current_loaded', 0);
$('#user-selection').data('search_query', '');
$("#user-selection .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#user-selection').data('search_query', $(this).val());
	$('#user-selection').data('current_loaded', 0);
	$("#user-selection .populate>ul").empty();
	$('#user-selection').trigger('load_entries');
});
$('#user-selection').on('load_entries', function(e) {
	Lib.Ajax.Dashboard.QueryUsers({
		search_query: $('#user-selection').data('search_query'),
		index: $('#user-selection').data('current_loaded'),
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
		 $('#user-selection').data('last-selected', null);
		let count = $('#user-selection').data('current_loaded');
		entries.map(function(entry) {
			let div = $("#template-user-selection-item").clone().show();
			div.removeAttr('id');
			div.attr('user_id', entry.user_id);
			div.on('click', function() {
				let last = $('#user-selection').data('last-selected');
				if(last)last.removeAttr("selected"); // TODO: fix this trash
				$('#user-selection').data('last-selected', $(this));
				$(this).attr("selected","");

				$("#user-editing li").removeAttr("selected");
				$("#user-editing li[group_id="+entry.group_id+"]").attr("selected", '');
				$("#user-editing").trigger('update', entry);
				div.trigger('refresh');
			});
			div.on('refresh', function() {
				Lib.Ajax.Dashboard.QueryUsers({
					search_query: div.data('user_data').username,
					index: 0,
					count: 1
				}).done(function(json) {
					if(json.status !== 'success') return;
					if(json.out === null) return;
					div.data('user_data', json.out[0]);
					div.trigger('update');
				});
			});
			div.on('update', function() {
				let data = div.data('user_data');
				div.attr('user_id', data.user_id);
				div.find(".title").text(data.display_name);
				div.find(".college").text(data.college + " ("+data.username+")");
				div.find(".group").text(data.group_name);
				div.find(".avatar").attr('data-jdenticon-value', data.username);

				$("#user-editing").trigger('update', data);
			})
			div.data('user_data', entry);
			div.trigger('update');
			div.appendTo("#user-selection .populate>ul");
		});
		$('#user-selection').data('current_loaded', count+entries.length);
	});
}).trigger('load_entries');
$('#user-selection .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#user-selection').trigger('load_entries');
	}
});

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

$("#user-editing").data('current_loaded', 0);
$("#user-editing").data('search_query', '');
$("#user-editing .search>input").on('keyup', function(e) {
	if(e.keyCode !== 13) return;
	$('#user-editing').data('search_query', $(this).val());
	$('#user-editing').data('current_loaded', 0);
	$("#user-editing .populate>ul").empty();
	$('#user-editing').trigger('load_entries');
});


$('#user-editing').on('load_entries', function(e) {
	Lib.Ajax.Dashboard.QueryGroups({
		search_query: $('#user-editing').data('search_query'),
		index: $('#user-editing').data('current_loaded'),
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
		$('#user-editing').data('last-selected', null);
		let count = $('#user-editing').data('current_loaded');
		entries.map(function(entry) {
			let div = $("#template-user-selection-item").clone().show();
			div.removeAttr('id');
			div.data('group_data', entry);
			div.attr('group_id', entry.group_id);
			div.find(".title").text(entry.display_name);
			div.find(".college").text("Level: "+entry.access_level);
			div.find(".avatar").attr('data-jdenticon-value', entry.name);

			div.appendTo("#user-editing .populate>ul");


			div.on('click', function() {
				let selected = $('#user-selection').data('last-selected').data('user_data');
				Lib.Ajax.Dashboard.AssignGroup({
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

				});
			});
		});
		$('#user-editing').data('current_loaded', count+entries.length);

	})
}).trigger('load_entries');
$('#user-editing .populate').on('scroll', function() {
	let th = $(this).find('ul').height();
	let vh = $(this).height();
	let s = $(this).scrollTop();
	let f = s/(th-vh);
	if(f > 0.95) { // check browser support ?!?!?
		$('#user-editing').trigger('load_entries');
	}
});