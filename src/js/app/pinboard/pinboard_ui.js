if(!Lib)var Lib = {};
if(!Lib.Pinboard)Lib.Pinboard={};
if(!Lib.Pinboard.UI)Lib.Pinboard.UI={};
Object.assign(Lib.Pinboard.UI, {
	Cleanup: function(data) {
		if($(window).data('editing_el')){
			$(window).data('editing_el').triggerHandler('unedit');
		}
	},
	Init: function(data) {
		$(window).data('editing_el', null);

		Lib.Pinboard.UI.InitGenerate(data);
	},
	InitGenerate: function(data) {
		var el_section = data.feed_section;
		var el_template_card = data.feed_template;
		var feed_type = data.feed_type;
		var ref_names = data.ref_names;

		el_section.on('generate_dummy', function(e, data) {
			el_section.triggerHandler('generate', {
				blk: {
					blk_id: 'DUMMY',
					metadata: JSON.stringify({
						handler: feed_type,
						pinboard_position: data.pinboard_position
					}),
					blk_refs: data.blk_refs
				},
				el_populate: data.el_populate,
				cb: function() {
					if(data.cb)data.cb.bind(this)(data);
				}
			});
		});

		el_section.on('saturation_react', function() {
			console.log("SAT REACT");
			var el_populate = el_section.find('.populate');
			var item_list = el_populate.data('isotope').filteredItems;
			var j = 0;
			var arr = [];

			for(var i in item_list) {
				var el = item_list[i].element;
				var blk = $(el).data('blk');
				arr.push({
					blk_id: blk.blk_id,
					metadata: { pinboard_position: j },
					update_owner: false
				});
				j += Lib.Pinboard.CREATE_INTERVAL;
			}
			//console.log(arr);
			Lib.Ajax.Singleton.UpdateMulti({
				data_array: arr
			}).done(function(json) {
				if(json.type != "success")return;
				json.blk_new_arr.map(function(x) {
					el_section.find('div[blk_id=\"'+x.blk_id+'\"]')
						.attr("pinboard_position", JSON.parse(x.metadata).pinboard_position);
				});
			});
		});

		el_section.on('generate', function(e, data) {
			var blk = data.blk;
			var blk_metadata = JSON.parse(blk.metadata);
			if(!blk_metadata.handler || blk_metadata.handler != feed_type) {
				alert('Critical error, incorrect blk feed');
				return;
			}

			var el_clone = el_template_card.clone()
				.show()
				.addClass('showsort')
				.attr('id', '')
				.attr('blk_id', blk.blk_id);

			var el_singleton = Lib.Singleton.UI.Populate({
				blk: blk,
				ref_names: ref_names,
				singleton_template: el_template_card
			});
			el_singleton.attr('pinboard_position', blk_metadata.pinboard_position);

			el_singleton.on('update', function() {
				var blk = el_singleton.data('blk');
				var blk_metadata = JSON.parse(blk.metadata);
				$(this).attr('pinboard_position', blk_metadata.pinboard_position);
			}).triggerHandler('update');

			el_singleton.on('expand', function() {
				el_singleton.find('.default.btn.bottom>i')
					.removeClass('fa-angle-down')
					.addClass('fa-angle-up');
			});
			el_singleton.on('deflate', function() {
				el_singleton.find('.default.btn.bottom>i')
					.removeClass('fa-angle-up')
					.addClass('fa-angle-down');
			});
			el_singleton.on('save_post', function(e, json) {
				if(json.type != "success") {
					Lib.App.Notify({
						title: "Pinboard save failed...",
						content: "Error: "+json.type,
						wait: 0,
						icon: 'fa fa-times'
					});
					return;
				};

				var blk = el_singleton.data('blk');
				Lib.Ajax.Singleton.Update({
					blk_id: blk.blk_id,
					metadata: {
						handler: feed_type
					}
				}).done(function(json) {
					if(json.type == "success") {
						$(el_singleton).triggerHandler('save_position');
						Lib.App.Notify({
							title: "Pinboard content save success",
							content: "Header, body and location saved successfully",
							wait: 2000,
							icon: 'fa fa-check'
						});
					} else {
						Lib.App.Notify({
							title: "Pinboard save failed...",
							content: "Error: "+json.type,
							wait: 0,
							icon: 'fa fa-times'
						});
					}
				});
			});

			el_singleton.on('save_position', function() {
				var blk = el_singleton.data('blk');
				Lib.Ajax.Singleton.Update({
					blk_id: blk.blk_id,
					metadata: {
						pinboard_position: parseInt($(this).attr('pinboard_position'))
					}
				}).done(function(json) {
					if(json.type == "success") {
						//console.log(json.blk_new);
						$(el_singleton).data('blk', json.blk_new);
					}
				});
			});

			el_singleton.on('delete_post', function(e, json) {
				if(json.type == "success") {
					Lib.App.Notify({
						title: "Feed delete success",
						content: "Delete process successful",
						wait: 1000,
						icon: 'fa fa-check'
					});
					$(this).remove();
				} else {
					Lib.App.Notify({
						title: "Delete failed...",
						content: "Error: "+json.type,
						wait: 0,
						icon: 'fa fa-times'
					});
				}
			});

			el_singleton.on('shift', function(e, b) {
				var el_populate = el_section.find('.populate');
			 	//console.log(el_populate);
				var item_list = el_populate.data('isotope').filteredItems;
				if(el_singleton[0] === item_list[b ? item_list.length-1 : 0].element)return;
				// find location	
				var i = 0;
				for(i=0;i<item_list.length;i++){if(el_singleton[0] === item_list[i].element)break;}
				if(i >= item_list.length)return;

				var j = i + (b ? 1 : -1);
				var pi = $(item_list[i].element).attr('pinboard_position');
				var pj = $(item_list[j].element).attr('pinboard_position');
				$(item_list[i].element).attr('pinboard_position', pj);
				$(item_list[j].element).attr('pinboard_position', pi);
				$(item_list[i].element).trigger('save_position');
				$(item_list[j].element).trigger('save_position');
				el_populate.isotope('updateSortData').isotope({ sortBy: 'pinboard_position' });
			});

			el_singleton.on('add', function(e, b) {
				var el_populate = el_section.find('.populate');
				var pinboard_position = 0;
				var item_list = el_populate.data('isotope').filteredItems;
				if(el_singleton[0] === item_list[b ? item_list.length-1 : 0].element) {
					pinboard_position = parseInt(el_singleton.attr('pinboard_position')) + (b?1:-1)*Lib.Pinboard.CREATE_INTERVAL;
				} else {
					// find location	
					var i = 0;
					for(i=0;i<item_list.length;i++){if(el_singleton[0] === item_list[i].element)break;}
					if(i >= item_list.length)return;
					var j = i + (b ? 1 : -1);
					var pi = parseInt($(item_list[i].element).attr('pinboard_position'));
					var pj = parseInt($(item_list[j].element).attr('pinboard_position'));
					var mp = Lib.Pinboard.CREATE_POSITION(pi, pj);
					if(Math.abs(mp - pi) <= 1) {
						Lib.App.Notify({
							title: "PINBOARD SATURATION --- SEVERE ERROR!",
							content: "RECREATING THE ENTIRE AREA",
							wait: 0,
							icon: 'fa fa-times'
						});
						el_section.triggerHandler('saturation_react');
						return;
					}
					pinboard_position = mp;
				}
				
				el_section.triggerHandler('generate_dummy', {
					blk_refs: {
						'header': {"data": "<h1>Title</h1><h2>Title Sub</h2>"},
						'body': {"data": "<p>Body</p>"}
					},
					pinboard_position: pinboard_position,
					cb: function(data) {
						el_section.triggerHandler('generate_post', {
							el_populate: el_populate,
							el_singleton: this
						});
						el_populate
						.isotope('prepended', this)
						.isotope('updateSortData')
						.isotope({ sortBy: 'pinboard_position' });
						$(this).triggerHandler('edit');
					}
				});
			});
			

			if(data.cb)data.cb.bind(el_singleton)(data);
		});
	}
});
