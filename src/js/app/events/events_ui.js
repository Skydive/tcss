if(!Lib)var Lib = {};
if(!Lib.Events)Lib.Events={};
if(!Lib.Events.UI)Lib.Events.UI={};
Object.assign(Lib.Events.UI, {
	Init: function(data) {
		var el_section = data.events_section;
		var el_template_card = data.template_event_card;
		var feed_type = data.feed_type || 'events';

		Lib.Events.UI.InitPopulate(data);
		//Lib.Events.UI.InitCreate(data);
		// Load Upcoming Events
		Lib.Feed.FeedFetchRange({
			feed_type: feed_type,
			date_start: moment.now(),
			date_end: moment.now()*2
		}, function(events) {
			var el_populate = el_section.find('.event.upcoming.populate');
			if(events.length == 0) {
				el_populate.parent().hide();
				return;
			}
			for(var i in events) {
				var event = events[i];
				el_section.trigger('populate', {
					event: event,
					el_populate: el_populate
				});
			}
			el_populate.masonry({
				"itemSelector": ".event.parent",
				"columnWidth": ".event.parent"
			});
		});

		// Load Past Events
		Lib.Feed.FeedFetchRange({
			feed_type: feed_type,
			date_start: 0,
			date_end: moment.now()
		}, function(events) {
			var el_populate = el_section.find('.event.past.populate');
			if(events.length == 0) {
				el_populate.parent().hide();
				return;
			}
			for(var i in events) {
				var event = events[i];
				el_section.trigger('populate', {
					event: event,
					el_populate: el_populate
				});	
			}
			el_populate.masonry({
				"itemSelector": ".event.parent",
				"columnWidth": ".event.parent"
			});
		});
	},
	InitPopulate: function(data) {
		var el_section = data.events_section;
		var el_template_card = data.template_event_card;

		el_section.on('populate', function(e, data) {
			var event = data.event;
			var ev_meta = JSON.parse(event.metadata);

			var el_clone = el_template_card.clone()
				.show()
				.attr('id', '')
				.attr('feed_date', ev_meta.feed_date);

			el_clone.data('event', event);
			el_clone.data('expanded', false);
			el_clone.data('editing', false);
			el_section.data('editing_el', null);

			if(Lib.User.State.type == "success") {
				var access_level = (Lib.User.Group.State.access_level);
				if(access_level <= Lib.User.Group.EAccessLevel.COMMITTEE) {
					el_clone.find('.btn.edit').show();
				} else {
					el_clone.find('.btn.edit').hide();
				}
			} else {
				el_clone.find('.btn.edit').hide();
			}

			el_clone.on('update', function(e) {
				var event = $(this).data('event');
				var md = JSON.parse(event.metadata);
				var date = moment.unix(md.feed_date).format("Do MMM YYYY - HH:mm");
				$(this).find('.date').html(date);
				
				var refs = event.blk_refs;
				if(!refs)return;
				if(refs.header)$(this).find('.header').html(refs.header.data);
				if(refs.body)$(this).find('.body').html(refs.body.data);
				if(refs.location)$(this).find('.loc').html(refs.location.data);
			}).triggerHandler('update');

			data.el_populate.append(el_clone);

			el_clone.find('.default.btn.bottom').on('click', function(e) {
				if(!el_clone.data('expanded')) { // expand
					el_clone.triggerHandler('expand');
				} else {
					el_clone.triggerHandler('deflate');
				}
			});
			el_clone.find('.editing.btn.bottom').on('click', function(e) {
				if(el_clone.data('editing')) { // save
					el_clone.triggerHandler('save');
				}
			});
			el_clone.find('.btn.edit').on('click', function(e) {
				if(!el_clone.data('editing')) { 
					if(!el_clone.data('expanded')) {
						el_clone.triggerHandler('expand');
					}
					el_clone.triggerHandler('edit');
				}
			});
			el_clone.find('.btn.exit').on('click', function(e) {
				if(el_clone.data('editing')) { 
					el_clone.triggerHandler('no-save');
				}
			});

			el_clone.find('.btn.delete').on('click', function(e) {
				if(el_clone.data('editing')) { 
					el_clone.triggerHandler('delete');
				}
			});


			el_clone.on('expand', function(e) {
				$(this).find('.expanded').show();
				$(this).find('.body').show();
				$(this).find('.default.btn.bottom>i')
					.removeClass('fa-angle-down')
					.addClass('fa-angle-up');
				data.el_populate.masonry();
				el_clone.data('expanded', true);
			});

			el_clone.on('deflate', function(e) {
				$(this).find('.body').hide();
				$(this).find('.expanded').hide();
				$(this).find('.footer').hide();
				$(this).find('.default.btn.bottom>i')
					.removeClass('fa-angle-up')
					.addClass('fa-angle-down');
				data.el_populate.masonry();
				el_clone.data('expanded', false);
			});

			el_clone.on('edit', function(e) {
				$(this).data('editing', true);
				$(this).find('.default').hide();
				$(this).find('.editing').show();
				console.log($(this).find('.default'));
				if(el_section.data('editing_el')) {
					el_section.data('editing_el').triggerHandler('unedit');
				}
				$(this).css('z-index', 100);
				el_section.data('editing_el', $(this));

				var edit_elements = [
					$(this).find('.header')[0],
					$(this).find('.body')[0],
					$(this).find('.loc')[0],
					$(this).find('.date-edit')[0]
				]

				var editor = ContentTools.EditorApp.get();
				editor.init(
					edit_elements,
					namingProp='class', 
					fixtureTest=null,
					withIgnition=false
				);
				editor.start();

			});
			el_clone.on('unedit', function(e) {
				var editor = ContentTools.EditorApp.get();
				editor.stop(true);

				el_clone.data('editing', false);
				$(this).find('.default').show();
				$(this).find('.editing').hide();

				el_section.data('editing_el', null);
				data.el_populate.masonry();
				$(this).css('z-index', 1);
			});

			el_clone.on('save', function(e) {
				el_clone.triggerHandler('unedit');
				var event = el_clone.data('event');
				var content = {};
				content['header'] = el_clone.find('.header').html();
				content['body'] = el_clone.find('.body').html();
				content['location'] = el_clone.find('.loc').html();

				// DATE
				var event = $(this).data('event');
				var md = JSON.parse(event.metadata);
				var new_meta = {};
				var m = moment(el_clone.find('.date').text(), 'Do MMM YYYY - HH:mm');
				if(!m.isValid()) {
					alert("Date invalid!");
					var date = moment.unix(md.feed_date).format("Do MMM YYYY [-] HH:mm");
					$(this).find('.date').html(date);
				} else {
					unix = m.unix();
					new_meta = {
						feed_date: unix
					};
					$(this).attr('feed_date', unix);
					// $(data.el_populate).sort(function(a, b) {
					// 	var contentA = parseInt($(a).attr('feed_date'));
					// 	var contentB = parseInt($(b).attr('feed_date'));
					// 	return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
					// });
					data.el_populate.masonry();
				}
				Lib.Ajax.Feed.Update({
					blk_id: event['blk_id'],
					content: content,
					metadata: new_meta
				});
			});
			el_clone.on('no-save', function(e) {
				// REVERT CHANGES
				el_clone.triggerHandler('update');
				el_clone.triggerHandler('unedit');
			});
		});
	}
});