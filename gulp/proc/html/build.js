const through = require('through2');
const path = require('path');
const Vinyl = require('vinyl');
const gulp = require('gulp');

function vinyl_string(v) {
	if(!Buffer.isBuffer(v)) {
		v = Buffer.from(content);
	}
	return v.toString();
}

module.exports = function(data) {
	let html_output = data.template;
	let output_name = data.output;
	let base = data.base;

	function bufferContents(file, enc, cb) {
		if(file.isNull()) {
			cb();
			return;
		}
		let path_repl = path.relative(base, file.path);
		if(path.dirname(path_repl) !== 'requires') {
			path_repl = path.basename(file.path);
		}
		let str = vinyl_string(file.contents);
		switch(path.extname(file.path)) {
		case '.js':
			str = `<script>\n${str}\n</script>`;
			break;
		case '.css':
			str = `<style>\n${str}\n</style>`;
			break;
		}
		html_output = html_output.replace(`<!-- ${path_repl} -->`, str);
		cb();
	}
	function endStream(cb) {
		this.push(new Vinyl({
			contents: Buffer.from(html_output),
			path: output_name
		}));
		cb();
	}
	return through.obj(bufferContents, endStream);
};