if(!SKY)var SKY={};
if(!SKY.Blk)SKY.Blk={};
if(!SKY.Ajax)SKY.Ajax={};
Object.assign(SKY.Ajax, {
	ENTRY_POINT: "/php/index.php", 
	Blk: {
		RefUpdate: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_ref_update",
				blk_id: data.username,
				blk_ref_id: data.password
			}, null, "json");
		},
		RefsFetch: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_fetch",
				blk_id: data.blk_id,
				count: data.count,
				index: data.index
			}, null, "json");
		}
	}
});
Object.assign(SKY.Blk, {
	Init: function() {
		
	}
});