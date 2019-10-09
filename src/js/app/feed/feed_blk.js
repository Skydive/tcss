if(!Lib)var Lib = {};
if(!Lib.Feed)Lib.Feed={};
Object.assign(Lib.Feed, {
	FeedFetchRange: function(data, cb) {
		// Fetch hashes
		Lib.Ajax.Feed.HashFetch({
			feed_type: data.feed_type,
			date_start: data.date_start,
			date_end: data.date_end,
			index: data.index || 0,
			count: data.count || 10
		}).done(function(json) {
			var feed_hashes = json.feed_hashes;
			var feed_missing = {};
			var feed_out = [];
			for(var i in feed_hashes) {
				var feed = feed_hashes[i];

				var cached_hash = localStorage.getItem("blk-"+feed.blk_id+"-hash") || "";
				if(feed['hash'] == cached_hash) {
					var md = JSON.parse(feed.metadata);
					var cached_blk = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("blk-"+feed.blk_id)) || {})  || {};
					feed_out.push(Object.assign(feed, {
						'feed_date': md.feed_date,
						'blk_refs': cached_blk.blk_refs
					}));
				} else {
					feed_missing[feed.blk_id] = feed;
				}
			}
			if(Object.keys(feed_missing).length == 0) {
				// fetch nothing...
				// PART 2
				feed_out.sort(function(a, b) {
					a = new Date(a.feed_date);
					b = new Date(b.feed_date);
					return a>b ? -1 : a<b ? 1 : 0;
				});
				//console.log('cacheall');
				if(cb)cb(feed_out);
				return;
			}

			SKY.Ajax.Blk.RefsFetch({
				blk_ids: Object.keys(feed_missing)
			}).done(function(json) {
				var feeds = JSON.parse(json['blks']);
				for(var i in feeds) {
					var feed = feeds[i];
					feed = feed || {
						blk_id: i,
						hash: '',
						metadata: '',
						blk_refs: {}
					};
					var md = JSON.parse(feed.metadata);
					localStorage.setItem("blk-"+feed.blk_id, LZString.compressToUTF16(JSON.stringify(feed)));
					localStorage.setItem("blk-"+feed.blk_id+"-hash", feed.hash);
					feed_out.push(Object.assign(feed, {
						'feed_date': md.feed_date
					}));
				}
				feed_out.sort(function(a, b) {
					a = new Date(a.feed_date);
					b = new Date(b.feed_date);
					return a>b ? -1 : a<b ? 1 : 0;
				});
				if(cb)cb(feed_out);
			});
		});
	},
	CachedRefsFetch: function(data, cb) {
		var cached_hash = localStorage.getItem("blk-"+data.blk_id+"-hash") || "";
		SKY.Ajax.Blk.HashFetch({
			blk_id: data.blk_id
		}).done(function(blk) {
			if(cached_hash === blk.hash) {
				var cached_blk = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("blk-"+data.blk_id)) || {}) || {};
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
				localStorage.setItem("blk-"+data.blk_id, LZString.compressToUTF16(JSON.stringify(store_blk)));
				cb(store_blk.blk_refs);
			});
		});
	}
});