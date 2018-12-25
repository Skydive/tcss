if(!Lib)var Lib = {};
if(!Lib.Pinboard)Lib.Pinboard={};
Object.assign(Lib.Pinboard, {
	CREATE_INTERVAL: 10000,
	CREATE_POSITION: function(p1, p2) {
		return Math.floor((p1+p2)/2);
	}
});