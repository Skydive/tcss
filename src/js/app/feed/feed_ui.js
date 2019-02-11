if(!Lib)var Lib = {};
if(!Lib.Feed)Lib.Feed={};
if(!Lib.Feed.UI)Lib.Feed.UI={};
Object.assign(Lib.Feed.UI, {
	Cleanup: function(data) {
		if($(window).data('editing_el')){
			$(window).data('editing_el').triggerHandler('unedit');
		}
	},
	Init: function(data) {
		$(window).data('editing_el', null);

		Lib.Feed.UI.InitGenerate(data);
	},
	InitGenerate: function(data) {
		var el_section = data.feed_section;
		var el_template_card = data.feed_template;
		var feed_type = data.feed_type;
		var ref_names = data.ref_names;

		el_section.on('generate_dummy', function(e, data) {
			var feed_date = data.feed_date;
			el_section.triggerHandler('generate', {
				blk: {
					blk_id: 'DUMMY',
					metadata: JSON.stringify({
						handler: feed_type,
						feed_date: data.feed_date
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
				.attr('id', '')
				.attr('blk_id', blk.blk_id);
			

			var el_singleton = Lib.Singleton.UI.Populate({
				blk: blk,
				ref_names: ref_names,
				singleton_template: el_template_card
			});
			el_singleton.attr('feed_date', blk_metadata.feed_date);

			el_singleton.on('update', function() {
				var blk = el_singleton.data('blk');
				var blk_metadata = JSON.parse(blk.metadata);
				var date = moment.unix(blk_metadata.feed_date).format("Do MMM YYYY [-] HH:mm");
				el_singleton.find('.date').html("<h2>"+date+"</h2>");

				if(blk.blk_id && blk.blk_id != "DUMMY") {
					el_singleton.find('.btn.link').show()
						.attr('href', "/single-feed/?blk_id="+blk.blk_id);
				} else {
					el_singleton.find('.btn.link').hide();	
				}

				var lst = el_singleton.find('.last-edited');
				if(blk_metadata.owner_username == null)lst.hide();
				lst.find('.avatar').jdenticon(blk_metadata.owner_username);
				lst.find('.upper').text(blk_metadata.owner_display_name+" ("+blk_metadata.owner_username+")");
				lst.find('.lower').text(blk_metadata.owner_group_name);
				
				var date = moment.unix(blk_metadata.owner_last_edit_date);
				if(blk_metadata.owner_last_edit_date && date.isValid()) {
					el_singleton.find('.lst-date').text(date.format("[at] HH:mm [on] DD[-]MM[-]YY"));
				}
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
						title: "Feed save failed...",
						content: "Error: "+json.type,
						wait: 0,
						icon: 'fa fa-times'
					});
					return;
				}
				Lib.App.Notify({
					title: "Feed content save success",
					content: "Header, body and location saved successfully",
					wait: 2000,
					icon: 'fa fa-check'
				});

				var blk = el_singleton.data('blk');

				var date_txt = el_singleton.find('.date').text();
				var date_m = moment(date_txt, 'Do MMM YYYY - HH:mm');				
				
				if(date_m.isValid() && date_m.get('year') > 1970 && date_m.get('year') < 3000) {
					Lib.Ajax.Singleton.Update({
						blk_id: blk.blk_id,
						metadata: {
							handler: feed_type,
							feed_date: date_m.unix()
						}
					}).done(function(json) {
						if(json.type == "success") {
							el_singleton.data('blk', json.blk_new);
							el_singleton.trigger('update');
							Lib.App.Notify({
								title: "Date modification success",
								content: "Date updated to: "+date_m.format('Do MMM YYYY - HH:mm'),
								wait: 1000,
								icon: 'fa fa-check'
							});
						} else {
							Lib.App.Notify({
								title: "Date modification failed...",
								content: "Error: "+json.type,
								wait: 0,
								icon: 'fa fa-times'
							});
						}
					});
					return;
				} else {
					Lib.App.Notify({
						title: "Date modification failed...",
						content: "You had entered an invalid date. The date has been reverted to its original value.",
						wait: 0,
						icon: 'fa fa-times'
					});
					blk_metadata = JSON.parse(blk.metadata);
                    var date = moment.unix(blk_metadata.feed_date).format("Do MMM YYYY [-] HH:mm");
                    el_singleton.find('.date').html("<h2>"+date+"</h2>");
				}
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
			if(data.cb)data.cb.bind(el_singleton)(data);
		});
	}
});