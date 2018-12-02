$(function() {
	Lib.Dashboard.UI.Groups.Init({
		group_selection: $("#group-selection"),
		group_user_selection: $("#group-users"),
		modals: {
			user_add: $("#modal-user-add"),
			user_add_confirm: $("#modal-user-add-confirm"),
			group_add: $("#modal-group-add"),
			group_assign: $("#modal-group-assign")
		},
		templates: {
			user_selection: $("#template-user-selection-item"),
			group_users: $("#template-group-users-item")
		}
	});
});

/*
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
*/