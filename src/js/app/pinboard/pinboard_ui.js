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
				}
				
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
						console.log(json.blk_new);
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

			el_singleton.on('create_right', function() {
				
			});

			if(data.cb)data.cb.bind(el_singleton)(data);
		});
	}
});