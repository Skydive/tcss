if(!Lib)var Lib = {};
if(!Lib.Ajax)Lib.Ajax={};
Object.assign(Lib.Ajax, {
	Singleton: {
		Update: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "singleton_update",
				blk_id: data.blk_id,
				metadata: JSON.stringify(data.metadata),
				content: JSON.stringify(data.content)
			}, null, "json");
		},
		UpdateMulti: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "singleton_update_multi",
				data_array: JSON.stringify(data.data_array)
			}, null, "json");
		},
		Delete: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "singleton_delete",
				blk_id: data.blk_id
			}, null, "json");
		},
		GenesisFetch: function(data) {
			return $.post(Lib.Ajax.ENTRY_POINT, {
				action: "genesis_fetch"
			}, null, "json");
		}
	}
});
