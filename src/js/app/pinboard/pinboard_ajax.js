if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	Pinboard: {
		HashFetch: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "pinboard_hash_fetch",
				feed_type: data.feed_type,
				index: data.index,
				count: data.count
			}, null, "json");
		}
	}
});