window.jdenticon_config = {
	replaceMode: "observe"
};

/*PAGE_CONFIG = {
	'name': '',
	'handler': 'page-content-body',
	'file': 'content.html',
	'subpages': [{
		'name': 'dashboard',
		'handler': 'nav-content-body',
		'file': 'nav-content.html',
		'subpages': []
	}]
};

let BUILD_TREE = function(obj, parent) {
	new_node = function(data, children) {return {data:data, children:children};};
	let p_path = (parent === undefined ? '' : parent.data.path);
	let head = {
		data: {
			name: obj.name,
			parent: parent,
			path: p_path+obj.name+'/',
			handler: obj.handler,
			file: obj.file
		}
	};
	head.children = obj['subpages'].map((x) => BUILD_TREE(x, head));
	return head;
};
PAGE_CONFIG_TREE = BUILD_TREE(PAGE_CONFIG);
PAGE_CONFIG_TREE_GET_PATH = function(href) {
	let urlObj = new URL(href);
	let head = PAGE_CONFIG_TREE;
	let pathname = urlObj.pathname;
	if(pathname == '/') return head;
	let names = pathname.split('/');
	names.shift(); // ''
	names.pop(); // ''
	while(names.length > 0) {
		let name = names.shift();
		let heads = head.children.filter(x => x.data.name == name);
		if(heads && heads.length > 0)
			head = heads[0];
	}
	return head;
};*/

$(function() {
	setTimeout(function() {
		$("#global-loader").fadeOut(500);
	}, 500);

	Lib.User.Init();
	$(window).trigger('user_token_validate');

	$(window).on('user_session_created', function(e, data) {
		console.log("[DEBUG] Logged in as: "+data.username);
		console.log("[DEBUG] With user_id: "+data.user_id);
	});

	$(window).on('user_session_destroyed', function() {
		console.log("[DEBUG] Session token invalid");
		console.log("[DEBUG] NO LOGIN");
	});

	$(window).on('user_group_success', function(e, data) {
		console.log("[DEBUG] Group manager has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with access_level: "+data.access_level);
	});

	$(window).on('user_group_failure', function() {
		console.log("[DEBUG] Group manager failed to find your assigned groupid");
	});

	$(window).on('user_atlas_success', function(e, data) {
		console.log("[DEBUG] Atlas has responded: ");
		console.log("[DEBUG] with display_name: "+data.display_name);
		console.log("[DEBUG] with college: "+data.college);
	});

	$(window).on('user_atlas_failure', function() {
		console.log("[DEBUG] Atlas has failed to find your crsid");
	});
});
