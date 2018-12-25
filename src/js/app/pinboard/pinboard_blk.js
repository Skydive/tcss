if(!Lib)var Lib = {};
if(!Lib.Pinboard)Lib.Pinboard={};
Object.assign(Lib.Pinboard, {
	Fetch: function(data, cb) {
		// Fetch hashes
		Lib.Ajax.Pinboard.HashFetch({
			feed_type: data.feed_type,
			index: data.index || 0,
			count: data.count || 10
		}).done(function(json) {
			var feed_hashes = json.pinboard_hashes;
			var feed_missing = {};
			var feed_out = [];
			for(var i in feed_hashes) {
				var feed = feed_hashes[i];

				var cached_hash = localStorage.getItem("blk-"+feed.blk_id+"-hash") || "";
				if(feed['hash'] == cached_hash) {
					var md = JSON.parse(feed.metadata);
					var cached_blk = JSON.parse(LZString.decompress(localStorage.getItem("blk-"+feed.blk_id)) || {})  || {};
					feed_out.push(Object.assign(feed, {
						'pinboard_position': md.pinboard_position,
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
					a = new Date(a.pinboard_position);
					b = new Date(b.pinboard_position);
					return a>b ? 1 : a<b ? -1 : 0;
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
					localStorage.setItem("blk-"+feed.blk_id, LZString.compress(JSON.stringify(feed)));
					localStorage.setItem("blk-"+feed.blk_id+"-hash", feed.hash);
					var md = JSON.parse(feed.metadata);
					feed_out.push(Object.assign(feed, {
						'pinboard_position': md.pinboard_position
					}));
				}
				feed_out.sort(function(a, b) {
					a = new Date(a.pinboard_position);
					b = new Date(b.pinboard_position);
					return a>b ? 1 : a<b ? -1 : 0;
				});
				if(cb)cb(feed_out);
			});
		});
	}
});