$(function() {
	Lib.Dashboard.UI.Users.Init({
		user_selection: $("#user-selection"),
		user_info: $("#user-info"),
		modals: {
			group_assign: $("#modal-group-assign")
		},
		templates: {
			user_selection: $("#template-user-selection-item"),
			group_users: $("#template-group-users-item")
		}
	});
});