if(!Lib)var Lib = {};
if(!Lib.Singleton)Lib.Singleton={};
if(!Lib.Singleton.UI)Lib.Singleton.UI={};
Object.assign(Lib.Singleton.UI, {
	Populate: function(data) {
		var el_template = data.singleton_template;
		var ref_names = data.ref_names;
		var blk = data.blk;
		var deletable = data.deletable;

		var el_singleton = el_template.clone()
			.show()
			.attr('id', '');

		el_singleton.data('blk', blk);
		el_singleton.data('expanded', false);
		el_singleton.data('editing', false);

		if(Lib.User.State.type == "success") {
			var access_level = (Lib.User.Group.State.access_level);
			if(access_level <= Lib.User.Group.EAccessLevel.COMMITTEE) {
				el_singleton.find('.btn.edit').show();
			} else {
				el_singleton.find('.btn.edit').hide();
			}
		} else {
			el_singleton.find('.btn.edit').hide();
		}

		
		el_singleton.on('update', function(e) {
			var blk = $(this).data('blk');
			$(this).attr('blk_id', blk.blk_id);
			var refs = blk.blk_refs;
			if(!refs)return;
			for(var i in ref_names.load) {
				var refname = ref_names.load[i];
				if(refs[refname])$(this).find('.'+refname).html(refs[refname].data);
			}
		}).triggerHandler('update');

		// ---- BUTTONS ----
		el_singleton.find('.default.btn.bottom').on('click', function(e) {
			if(!el_singleton.data('expanded')) { // expand
				el_singleton.triggerHandler('expand');
			} else {
				el_singleton.triggerHandler('deflate');
			}
		});
		el_singleton.find('.editing.btn.bottom').on('click', function(e) {
			if(el_singleton.data('editing')) { // save
				el_singleton.triggerHandler('save');
			}
		});
		el_singleton.find('.btn.edit').on('click', function(e) {
			if(!el_singleton.data('editing')) { 
				if(!el_singleton.data('expanded')) {
					el_singleton.triggerHandler('expand');
				}
				el_singleton.triggerHandler('edit');
			}
		});
		el_singleton.find('.btn.exit').on('click', function(e) {
			if(el_singleton.data('editing')) { 
				el_singleton.triggerHandler('no-save');
			}
		});

		el_singleton.find('.btn.delete').on('click', function(e) {
			if(el_singleton.data('editing')) { 
				el_singleton.triggerHandler('delete');
			}
		});

		// ---- EVENTS ----
		el_singleton.on('revert', function() {
			if($(this).data('editing'))
				$(this).triggerHandler('unedit');
			if($(this).data('expanded'))
				$(this).triggerHandler('deflate');
		});
		el_singleton.on('expand', function(e) {
			$(this).find('.expanded').show();
			$(this).find('.deflated').hide();
			$(this).data('expanded', true);
		});

		el_singleton.on('deflate', function(e) {
			$(this).find('.expanded').hide();
			$(this).find('.deflated').show();
			$(this).data('expanded', false);
		});

		el_singleton.on('edit', function(e) {
			if(!el_singleton.data('expanded'))
				$(this).triggerHandler('expand');
			$(this).data('editing', true);
			$(this).find('.default').hide();
			$(this).find('.editing').show();
			if($(window).data('editing_el')) {
				$(window).data('editing_el').triggerHandler('unedit');
			}
			$(this).css('z-index', 100);
			$(window).data('editing_el', $(this));


			var edit_elements = ref_names.edit
				.map(function(x) {return el_singleton.find('.'+x)[0];})
				.filter(function(x) {return x != null;});

			var editor = ContentTools.EditorApp.get();
			editor.init(
				edit_elements,
				namingProp='class', 
				fixtureTest=null,
				withIgnition=false
			);
			editor.start();

		});
		el_singleton.on('unedit', function(e) {
			var editor = ContentTools.EditorApp.get();
			editor.stop(true);
			editor.destroy();

			$(this).data('editing', false);
			$(this).find('.default').show();
			$(this).find('.editing').hide();

			$(window).data('editing_el', null);
			$(this).css('z-index', 1);
		});

		el_singleton.on('save', function(e) {
			$(this).triggerHandler('unedit');
			var content = {};
			ref_names.save.map(function(x) {content[x] = el_singleton.find('.'+x).html();});

			var blk = $(this).data('blk');
			Lib.Ajax.Singleton.Update({
				blk_id: blk.blk_id == "DUMMY" ? '' : blk.blk_id,
				content: content
			}).done(function(json) {
				if(json.type == "success") {
					console.log(json.blk_new);
					$(el_singleton).data('blk', json.blk_new);
				}
				$(el_singleton).triggerHandler('save_post', json);
			});
		});
		el_singleton.on('no-save', function(e) {
			// REVERT CHANGES
			$(this).triggerHandler('update');
			$(this).triggerHandler('unedit');
		});

		el_singleton.on('delete', function(e) {
			var blk = $(this).data('blk');

			$(this).triggerHandler('revert');
			if(!$(this).attr('blk_id') || $(this).attr('blk_id') == "DUMMY") {
				$(this).triggerHandler('delete_post', {
					type: 'success'
				});
			} else {
				Lib.Ajax.Singleton.Delete({
					blk_id: blk.blk_id
				}).done(function(json) {
					el_singleton.triggerHandler('delete_post', json);
				});
			}
		});
		return el_singleton;
	}
});