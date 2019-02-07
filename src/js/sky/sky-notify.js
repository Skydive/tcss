if(!SKY)var SKY={};
if(!SKY.UI)SKY.UI={};
SKY.UI = {
	Notify:{
		Show:function(options){
			if(!options)options = {};
			if(!options.fade)options.fade = {};
			var clone = options.template ? $(options.template).clone() : $('<div class="sky-notify" style="display:none;margin-bottom:10px;color: #fff; padding: 10px; "> <div style="display: flex;position: relative;"> <div style="font-size: 24px;text-align: center;"> <span class="icon"></span> </div> <div style=" width: 100%;margin-left:6px; "> <span class="fa fa-times exit" style=" position: absolute; right: 4px; top: 4px; cursor: pointer; display:none;font-size: 16px;"></span> <b><p class="title" style="font-size: 16px;margin:0;margin-right: 20px">test</p></b> <div class="spacer" style="display:none; height: 1px; background: #fff; "> </div> <div class="content" style=""></div> </div> </div> </div>').clone();
			var title = options.title;
			var content = options.content;
			var icon = options.icon;
			var style = options.style;
			var animation = options.animation;
			var animationSpeed = options.animationSpeed;
			var fadeIn = options.fade.in;
			var wait = options.fade.wait;
			var fadeOut = options.fade.out;
			var expandTime = options.expandTime;
			var expandSize = options.expandSize || 83;
			var el = $(options.el);
			
			clone.find('.title').html(title);
			if(content){
				clone.find('.content').html(content);
				//clone.find('.spacer').show();
			}
			else
			{
				clone.find('.content').remove();
				clone.find('.title').css({
					marginTop:'6px'
				});
			}
			if(icon)clone.find('.icon').addClass(icon).css({
				width:'30px'
			});
			clone.first().css(style);

			if(options.onBeforeShow)options.onBeforeShow(clone);

			clone.data('obj',options);
			el.prepend(clone);

			clone.wrap('<div style="height:0px;"></div>');

			expandSize+=10;
			clone.parent().animate({
				height:expandSize+'px'
			},expandTime,function(){
				var el = $(this).children(0);
				el.unwrap();

				if(animation){
					if(animationSpeed){
						el.css({
							'animation':animation+' '+animationSpeed/1000+'s'
						});
					}
					el.show();
					el.animateCss(animation,function(el){
						el.css({
							'animation':''
						});
					});
				}
				
				if(!animation && fadeIn){
					el.fadeIn(fadeIn);
				} else {
					el.show();
				}

				if(wait){
					setTimeout(function(obj){
						if(obj.fadeOut){
							obj.el.fadeOut(obj.fadeOut);
						}
					},wait,{
						fadeOut:fadeOut,
						el:el
					});
				}
				else
				{
					el.find('.exit').show().on('click',function(){
						var el = $(this).closest('.sky-notify');
						var data = el.data('obj');

						el.wrap('<div></div>');

						el.fadeOut(data.fade.out);

						el.parent().animate({
							height:'0px'
						},data.fade.out,function(){
							$(this).remove();
						});
					});
				}
			});

		},
		Hide:function(options){
			if(!options)options = {};
			var el = options.el;
			//To be finished
		}
	},
};