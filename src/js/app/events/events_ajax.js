if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	Events: {
		Create: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "events_create",
				event_date: data.event_date,
				content: JSON.stringify(data.content)
			}, null, "json");
		},
		Update: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "events_update",
				event_id: data.event_id,
				event_date: data.event_date,
				content: JSON.stringify(data.content)
			}, null, "json");
		},
		RefsFetch: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "events_fetch",
				event_ids: JSON.stringify(data.event_ids)
			}, null, "json");
		},
		HashFetch: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "events_hash_fetch",
				index: data.index,
				count: data.count,
				date_start: data.date_start,
				date_end: data.date_end
			}, null, "json");
		}
	}
});