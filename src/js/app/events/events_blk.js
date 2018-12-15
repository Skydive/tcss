if(!Lib)var Lib = {};
if(!Lib.Events)Lib.Events={};
Object.assign(Lib.Events, {
	EventsFetchRange: function(data, cb) {
		// Fetch hashes
		Lib.Ajax.Events.HashFetch({
			date_start: data.date_start,
			date_end: data.date_end,
			index: data.index || 0,
			count: data.count || 500
		}).done(function(json) {
			var event_hashes = json['event_hashes'];
			var evs_missing = {};
			var events_out = [];
			for(var i in event_hashes) {
				var evh = event_hashes[i];
				var event_date = evh['event_date'];
				var cached_blk_hash = localStorage.getItem("blk-"+evh['blk_id']+"-hash") || "";
				if(evh['blk_hash'] == cached_blk_hash) {
					var cached_blk = JSON.parse(localStorage.getItem("blk-"+evh['blk_id'])) || {};
					events_out.push({
						'event_id': evh['event_id'].toString(),
						'event_date': evh['event_date'],
						'blk': cached_blk
					});
				} else {
					evs_missing[evh['event_id']] = evh;
				}
			}
			if(Object.keys(evs_missing).length == 0) {
				// fetch nothing...
				// PART 2
				events_out.sort(function(a, b) {
					a = new Date(a.event_date);
					b = new Date(b.event_date);
					return a>b ? -1 : a<b ? 1 : 0;
				});
				console.log('cacheall');
				if(cb)cb(events_out);
				return;
			}
			Lib.Ajax.Events.RefsFetch({
				event_ids: Object.keys(evs_missing)
			}).done(function(json) {
				var events = json['events'];

				for(var i in events) {
					var event = events[i];
					event.blk = event.blk || {
						blk_id: evs_missing[event.event_id]['blk_id'],
						blk_hash: '',
						blk_refs: {}
					};
					var blk = event.blk;
					localStorage.setItem("blk-"+blk.blk_id, JSON.stringify(blk));
					localStorage.setItem("blk-"+blk.blk_id+"-hash", blk.blk_hash);
					events_out.push(event);
				}
				events_out.sort(function(a, b) {
					a = new Date(a.event_date);
					b = new Date(b.event_date);
					return a>b ? -1 : a<b ? 1 : 0;
				});
				if(cb)cb(events_out);
			});
		});
	},
	CachedRefsFetch: function(data, cb) {
		var cached_blk_hash = localStorage.getItem("blk-"+data.blk_id+"-hash") || "";
		SKY.Ajax.Blk.HashFetch({
			blk_id: data.blk_id
		}).done(function(blk) {
			if(cached_blk_hash === blk.blk_hash) {
				var cached_blk = JSON.parse(localStorage.getItem("blk-"+data.blk_id)) || {};
				if(cached_blk) {
					cb(cached_blk.blk_refs);
					return;
				}
			}
			SKY.Ajax.Blk.RefsFetch({
				blk_id: data.blk_id
			}).done(function(json) {
				// Reset hash
				localStorage.setItem("blk-"+data.blk_id+"-hash", blk.blk_hash);

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
				localStorage.setItem("blk-"+data.blk_id, JSON.stringify(store_blk));
				cb(store_blk.blk_refs);
			});
		});
	}
});