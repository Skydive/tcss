if(!SKY)var SKY={};
if(!SKY.Blk)SKY.Blk={};
if(!SKY.Ajax)SKY.Ajax={};
Object.assign(SKY.Ajax, {
	ENTRY_POINT: "/php/index.php", 
	Blk: {
		RefUpdate: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_ref_update",
				blk_id: data.blk_id,
				blk_ref_id: data.blk_ref_id,
				metadata: data.metadata,
				data: data.data
			}, null, "json");
		},
		RefsFetch: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_fetch",
				blk_id: data.blk_id,
				count: data.count,
				index: data.index
			}, null, "json");
		},
		HashFetch: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_hash_fetch",
				blk_id: data.blk_id
			}, null, "json");
		}
	}
});
Object.assign(SKY.Blk, {
	Init: function() {
		$('[blk_id]').map(function(k, v) {
			var blk_id = $(v).attr('blk_id');
			var refs = SKY.Ajax.Blk.RefsFetch({
				'blk_id': blk_id
			}).done(function(json) {
				console.log(json);
				var refs = json.blk_refs;
				json.blk_refs.map(function(ref) {
					$('[blk_ref_name]').map(function(k2, v2) {
						if($(v2).attr('blk_ref_name') == ref.blk_ref_name) {
							$(v2).html(ref.data);						
							$(v2).on('focusout', function(e) {
								SKY.Ajax.Blk.RefUpdate({
									'blk_id': ref.blk_id,
									'blk_ref_id': ref.blk_ref_id,
									'data': $(this).html()
								}).done(function(json) {
									console.log(json);
								});
							});
						}
					});
				});
			});
		});	
	},
	RefsFetch: function(data, cb) {
		var blk_hash = localStorage.getItem("blk-"+data.blk_id+"-hash");
		var blk_names = JSON.parse(localStorage.getItem("blk-"+data.blk_id+"-names"));
		SKY.Ajax.Blk.HashFetch({
			blk_id: data.blk_id
		}).done(function(json) {
			if(blk_hash == json.blk_hash) {
				var out = {};
				for(var name in blk_names) {
					out[name] = localStorage.getItem("blk-"+data.blk_id+"-name-"+name);
				}
				cb(out);
			} else {
				var refs = SKY.Ajax.Blk.RefsFetch({
					'blk_id': blk_id
				}).done(function(json) {
					localStorage.setItem("blk-"+data.blk_id+"-hash");

					var names = json.blk_refs.map(function(x) {return x.blk_ref_name;});
					localStorage.setItem("blk-"+data.blk_id+"names", JSON.stringify(names));
					var out = {};
					var blk_refs = json.blk_refs;
					for(var i in blk_refs) {
						var ref = blk_refs[i];
						var name = ref.blk_ref_name;
						localStorage.setItem("blk-"+data.blk_id+"-name-"+name, ref.data);
						out[name] = ref.data;
					}
					cb(out);
				});
			}
		});
	}
});