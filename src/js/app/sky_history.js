if(!SKY)var SKY = {};
SKY.History = {
	Debug:1,
	Vars:{
		Ignore:0
	},
	Ajax:0,
	Referrer:sessionStorage.referrer ? sessionStorage.referrer : document.referrer,
	CurrentUrl:window.location.href,
	Ignore:function(val){
		if(val != 0 || val != 1)val = 1;
 
		SKY.History.Vars.Ignore = val;
	},
	Manager:function(options){
		var url = options['url'];
		var obj = {};
		if(options['obj'])obj = options['obj'];
 
		var urlObj = new URL(url);
 
		if(urlObj['hostname'] == window.location.hostname){
			$(SKY.History).trigger('internalClick',{
				el:options.el
			});
 
			SKY.History.pushState(obj,url);
			return;
		}
 
		$(SKY.History).trigger('externalClick',{
			el:options.el
		});
 
		switch(options.target){
			case '_blank':
				window.open(url);
			break;
			default:
				window.location = url;
		}
	},
	PageSwitch:function(options){
		if(SKY.History.Ajax)SKY.History.Ajax.abort();
 
		var path = options['dataPath'];
 
		$('.page-content').css({
			opacity:0.5,
			pointerEvents:'none'
		});
		SKY.History.Ajax = $.ajax({
			type: 'GET',
			url: path+'/content.html',
			complete: function(data){  
				$('#page-content-footer').remove();
				$('#page-content-body').empty().append(data.responseText).css({
					opacity:'',
					pointerEvents:''
				});

				if(options['callback'])options['callback'](data);
			}
		})
	},
 
	pushState:function(obj,url){
		obj.referrer = window.location.href;
		SKY.History.SetReferrer();
	   
		History.pushState(obj,'',url);
	},
	replaceState:function(obj,url){
		var state = History.getState();
		obj.referrer = state.data.referrer;
		SKY.History.SetReferrer();
	   
		History.replaceState(obj,'',url);
	},
	SetReferrer:function(){
		var state = History.getState();
		var referrer = state.data.referrer ? state.data.referrer : document.referrer;
 
		SKY.History.Referrer = referrer;
		sessionStorage.referrer = referrer;
	}
}
 
$(document.body).on('click.SKY-history', "a[history-obj]",function(e){
	var el = $(this);
 
	var json = el.attr("history-obj");
	if(json)json = JSON.parse(json);
 
	var url = el.prop("href");
	var target = el.prop("target");
 
	SKY.History.Manager({
		el:el,
		obj:json,
		url:url,
		target:target
	});
 
	return false;
});
 
if(!History.enabled){
	$(SKY.History).trigger('not-supported');
}
 
History.Adapter.bind(window, 'statechange', function(e) {
	var debug = SKY.History.Debug;//1;
	var currentUrl = SKY.History.CurrentUrl;
	//if(SKY.App)SKY.App.UpdateTitle();
 	// Update title;

	if(debug)console.log("History: state change called");
	if(debug)console.log("History: currentUrl", currentUrl);
 
	//ignore the state change
	if(SKY.History.Vars.Ignore){
		SKY.History.Vars.Ignore = 0;
		if(debug)console.log('History: Ignored');
		return;
	}
 
	var state = History.getState();
	var reloadUrl = true;
 
	state['urlObj'] = new URL(state['url']);
 
	SKY.History.SetReferrer();
 
	//do not reload the page
	if(state['data']['noreload']){
		if(debug)console.log('History: Noreload');
		reloadUrl = false;
	}
 
	//if the path is different to the current path allow page reload
	if(state['data']['pathRedirect']){
		if(debug)console.log('History: Path redirect');
		var newUrl = new URL(state['url']);
	   
		if(newUrl['pathname'] != new URL(currentUrl)['pathname']){
			reloadUrl = true;
		}
		else
		{
			reloadUrl = false;
		}
	}
 
	//if the path check is set and it doesn't have to reload we wont call the init function
	if(state['data']['pathRedirect'] == 2 && !reloadUrl){
		if(debug)console.log('History: Callback ignored redirect');
		state['data']['initCallback'] = 0;
	}
 
	if(state['data']['initCallback'] && !reloadUrl){
		if(debug)console.log('History: Callback');
		i//f(SKY.App && SKY.App.Page.Init)SKY.App.Page.Init();
	}
 
	if(state['data']['initCallback'] == 2 && reloadUrl){
		if(debug)console.log('History: Callback ignored redirect');
		state['data']['initCallback'] = 0;
	}
 
	if(reloadUrl){
		$(SKY.History).trigger('deconstruct');
 
		SKY.History.PageSwitch({
			dataPath:state['data']['dataPath'] || state['urlObj']['origin']+state['urlObj']['pathname'],
			callback:function(){
				var state = History.getState();
				if(debug)console.log("History: page switch", state['url']);
				if(debug)console.log("state", state['data']);
 			
 				$(SKY.History).trigger('construct');

				if(state['data']['initCallback'] == 1){
					if(debug)console.log('History: Callback after load');
					//if(SKY.App && SKY.App.Page.Init)SKY.App.Page.Init();
				}
			}
		});
	}
 
	SKY.History.CurrentUrl = window.location.href;
});