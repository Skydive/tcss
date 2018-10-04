const fs = require('fs');
const path = require('path');

const through = require('through2');
const Vinyl = require('vinyl');
const gulp = require('gulp');

const cheerio = require('cheerio');

function vinyl_string(v) {
	if(!Buffer.isBuffer(v)) {
		v = Buffer.from(content);
	}
	return v.toString();
}

function parse_template(template) {
	let regex_command = /<!--@(.*) (.*) -->/g;
	let out = [];
	let m = null;
	while ((m = regex_command.exec(template)) !== null){
		out.push({
			raw: m[0],
			command: m[1],
			args: m[2]
		});
	}
	return out;
};
function process_template(args) {
	let parsed_template = parse_template(args.template);
	let out = {};
	parsed_template.filter(x => x.command === 'output-begin').map(function(x) {
		let regex_grab = new RegExp("<!--@output-begin "+x.args+" -->([\\s\\S]*)<!--@output-end "+x.args+" -->", 'g');
		let m = null;
		while ((m = regex_grab.exec(args.template)) !== null) {
			let content = m[1];
			let regex_import = /<!--@import (.*) -->/g;
			content = content.replace(regex_import, function(n, src) {
				let type = path.extname(src);
				if(src[0] === "/") {
					src = path.join(`${args.content_path}`, src.substr(1, src.length));
				} else {
					src = path.join(`${args.base}`, src);
				}
				let data = '';
				if(fs.existsSync(src)) {
					data = fs.readFileSync(src);
				}
				switch(type) {
				case '.css':
					data = `<style>${data}</style>`;
					break;
				case '.js':
					data = `<script>${data}</script>`;
					break;
				}
				return data;
			});
			out[x.args] = content;
		}
	});
	return out;
}

function build_html(data) {
	let base = data.base;
	let content_path = data.content_path;
	let template = "";
	function bufferContents(file, enc, cb) {
		// loaded template
		if(file.isNull()) {
			cb();
			return;
		}
		if(path.basename(file.path) == "template.html") {
			template = vinyl_string(file.contents);	
		}
		cb();
	}
	function endStream(cb) {
		let out = process_template({
			template: template,
			content_path: content_path,
			base: base
		});
		for(let dest in out) {
			this.push(new Vinyl({
				contents: Buffer.from(out[dest]),
				path: dest
			}));
		}
		cb();
	}
	return through.obj(bufferContents, endStream);
};

module.exports = {build_html, parse_template, process_template};