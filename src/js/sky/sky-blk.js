/*
	Blk Manager
	Date created: 3-12-18
	
	We seek methods to allow dynamic data to work correctly, and notably
	reduce the amount of data exchanged with the server. 

	Teaches a profound lesson on the concept of 'reverse scaling',
	using localStorage, and no lzo compression. This method of
	storing dynamic content will fail within a year.
*/

//-------------------- GLOBALS --------------------
if(!SKY)var SKY={};
if(!SKY.Blk)SKY.Blk={};
if(!SKY.Ajax)SKY.Ajax={};

//--------------- BACKEND INTERFACE ---------------
Object.assign(SKY.Ajax, {
	ENTRY_POINT: "/php/index.php", 
	Blk: {
		RefUpdate: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_ref_update",
				blk_id: data.blk_id,
				blk_ref_id: data.blk_ref_id,
				data: data.data
			}, null, "json");
		},
		RefsFetch: function(data) {
			return $.post(SKY.Ajax.ENTRY_POINT, {
				action: "blk_fetch",
				blk_ids: JSON.stringify(data.blk_ids),
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

//-------------------- BLK CLASS ------------------
Object.assign(SKY.Blk, {
	Storage: {
		CachingUserAgent: function() {
			// Chromium
			var isChromium = !!window.chrome;
			// Only cache for chrome
			return isChromium;
		},
		getItem: function(k, v) {
			return SKY.Blk.Storage.CachingUserAgent() ? localStorage.getItem(k) : null;
		},
		setItem: function(k, v) {
			if(SKY.Blk.Storage.CachingUserAgent())
				localStorage.setItem(k, v);
		}
	},
	Init: function() {
		$('[blk_id]').map(function(k, v) {
			var blk_id = $(v).attr('blk_id');
			var refs = SKY.Blk.CachedRefsFetch({
				'blk_ids': [blk_id]
			}, function(refs) {
				for(var i in refs) {
					var ref = refs[i];
					var dom_ref = $('[blk_ref_name="'+ref.blk_ref_name+'"]');
					console.log(dom_ref);
					dom_ref.html(ref.data);
					dom_ref.on('focusout', function(e) {
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
	},
	CachedRefsFetch: function(data, cb) {
		// DISABLE BLK CACHE FETCH
		//var cached_blk_hash = localStorage.getItem("blk-"+data.blk_id+"-hash") || "";
		SKY.Ajax.Blk.HashFetch({
			blk_id: data.blk_id
		}).done(function(blk) {
			if(cached_blk_hash === blk.blk_hash) {
				var cached_blk = JSON.parse(LZString.decompressFromUTF16(SKY.Blk.Storage.getItem("blk-"+data.blk_id)) || {}) || {};
				if(cached_blk) {
					cb(cached_blk.blk_refs);
					return;
				}
			}
			SKY.Ajax.Blk.RefsFetch({
				'blk_ids': [data.blk_id]
			}).done(function(json) {
				// Reset hash
				SKY.Blk.Storage.setItem("blk-"+data.blk_id+"-hash", blk.blk_hash);

				// Reload BLK
				var store_blk = {
					blk_id: blk.blk_id,
					blk_hash: blk.blk_hash,
					blk_refs: {}
				};
				for(var i in json.blk_refs) {
					var ref = json.blk_refs[i];
					store_blk.blk_refs[ref.blk_ref_name] = ref;
				}
				SKY.Blk.Storage.setItem("blk-"+data.blk_id, LZString.compressToUTF16(JSON.stringify(store_blk)));
				cb(store_blk.blk_refs);
			});
		});
	}
});