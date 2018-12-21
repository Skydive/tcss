if(!SKY)var SKY={};
if(!SKY.Nav)SKY.Nav={};
if(!SKY.Nav.Carousel)SKY.Nav.Carousel={};



Object.assign(SKY.Nav.Carousel, {
	ANIMATE_CLASSNAMES: {
		"down": {
			'cur': 'slideOutUp fastest',
			'dest': 'slideInUp fastest'
		},
		"up": {
			'cur': 'slideOutDown fastest',
			'dest': 'slideInDown fastest'
		},
		"left": {
			'cur': 'slideOutRight fastest',
			'dest': 'slideInLeft fastest'
		},
		"right": {
			'cur': 'slideOutLeft fastest',
			'dest': 'slideInRight fastest'					
		}
	},
	CAROUSEL_PAGE_CSS: {
		'position': 'absolute',
		'top': '0',
		'left': '0',
		'width': '100%',
		'height': '100%'
	},
	Create: function(data) {
		// TODO: ARROWS INDEP OF FA-5
		var el = data.el;
		data.switch_time = data.switch_time | 500;

		var cpages = $(el).find("> [carousel-page]");
		cpages.css(SKY.Nav.Carousel.CAROUSEL_PAGE_CSS);
		cpages.hide();
		cpages.first().show();
		cpages.first().attr('carousel-cur', '');
		
		var arrows = {};
		["up", "right", "down", "left"].map(function(x) {
			var arrow = SKY.Nav.Carousel.GenerateArrow({direction: x});
			arrow.appendTo(el);
			arrows[x] = arrow;

			arrow.on('click', function(e) {
				if($(el).data('btransition_state')) return;
				var cur_page = $(el).find('> [carousel-cur]');
				var dest = $(el).find('#'+cur_page.attr('carousel-'+x));
				if(dest.length == 0)return;
				$(el).triggerHandler('carousel_transition', {
					direction: x,
					dest: dest
				});
			});

			$(el).on('carousel_refresh_arrows', function(e) {
				var cur_page = $(el).find('> [carousel-cur]');
				var dest = cur_page.attr('carousel-'+x);
				if(dest) {
					arrow.fadeIn(250);
				} else {
					arrow.fadeOut(250);
				}
			})
		});
		$(el).data('carousel_arrows', arrows);
		$(el).triggerHandler('carousel_refresh_arrows');

		$(el).data('btransition_state', false);
		$(el).on('carousel_transition', function(e, data) {
			// TODO: Split this function (animate after a FORMAL and instanteneous transition)
			if($(el).data('btransition_state'))return;
			$(el).data('btransition_state', true);

			var cur_page = $(el).find('> [carousel-page][carousel-cur]');
			var dest = data.dest;
			data.switch_time = data.switch_time || 250;

			$(el).triggerHandler('carousel_transition_pre', {
				dest: dest
			});

			
			dest.show();
			cur_page.removeAttr('carousel-cur');
			var params = SKY.Nav.Carousel.ANIMATE_CLASSNAMES;
			cur_page.animateCss(params[data.direction]['cur'], function() {
				cur_page.hide();
			});
			dest.animateCss(params[data.direction]['dest'], function() {
				$(el).triggerHandler('carousel_transition_post', {
					dest: dest
				});
				
				dest.attr('carousel-cur', '');
				$(el).triggerHandler('carousel_refresh_arrows');
				$(el).data('btransition_state', false);
				$(cur_page).triggerHandler('carousel_leave');
				$(dest).triggerHandler('carousel_enter');
			});
		});
	},
	GenerateArrow: function(data) {
		// TODO - Template these
		var arrow = $('<div style="position:absolute;z-index:10;cursor:pointer;"><i class="fal"></i></div>');
		arrow.find('i').addClass('fa-chevron-'+data.direction);
		arrow.css({
			'color': 'inherit',
			'transition': 'color 500ms ease-in'
		})
		switch(data.direction) {
		case "left":
			arrow.css({
				'left': '10px',
				'top': '50%',
				'transform': 'translateY(-50%)'
			});
			break;
		case "right":
			arrow.css({
				'right': '10px',
				'top': '50%',
				'transform': 'translateY(-50%)'
			});
			break;
		case "up":
			arrow.css({
				'top': '-20px',
				'left': '50%',
				'transform': 'translateX(-50%)'
			});
			break;
		case "down":
			arrow.css({
				'bottom': '-20px',
				'left': '50%',
				'transform': 'translateX(-50%)'
			});
			break;
		}
		return arrow;
	}
});