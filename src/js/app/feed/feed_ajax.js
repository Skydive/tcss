if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	Feed: {
		Create: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "feed_create",
				feed_date: data.feed_date,
				content: JSON.stringify(data.content)
			}, null, "json");
		},
		Update: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "feed_update",
				blk_id: data.blk_id,
				metadata: JSON.stringify(data.metadata),
				content: JSON.stringify(data.content)
			}, null, "json");
		},
		HashFetch: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "feed_hash_fetch",
				feed_type: data.feed_type,
				index: data.index,
				count: data.count,
				date_start: data.date_start,
				date_end: data.date_end
			}, null, "json");
		}
	}
});