if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	Dashboard: {
		QueryUsers: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "dashboard_query_users",
				index: data.index,
				count: data.count,
				search_query: data.search_query,
				group_id: data.group_id
			}, null, "json");
		},
		QueryGroups: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "dashboard_query_groups",
				index: data.index,
				count: data.count,
				search_query: data.search_query
			}, null, "json");
		},
		GroupAssign: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "dashboard_group_assign",
				user_id: data.user_id,
				group_id: data.group_id
			}, null, "json");
		}
	}
});