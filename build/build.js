const g = require('./globals.js');

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

const fs = require('fs');
const glob = require('glob');
const path = require('path');

const exec = {
	js: function(lib) {
		console.log(`Building ${lib.path}:`);
		const files = lib.files.map(function(file_glob, i) {
			return `${g.content_path}/${lib.path}/${file_glob}`;
		});
		console.log(files);
		gulp.src(files)
			.pipe(concat(lib.options.output))
			.pipe(uglify())
			.pipe(gulp.dest(lib.options.dest));
		
		console.log(`Output: ${lib.options.dest}/${lib.options.output}`);
	},
	css: function(lib) {
		console.log(`Building ${lib.path}:`);
		const files = lib.files.map(function(file_glob, i) {
			return `${g.content_path}/${lib.path}/${file_glob}`;
		});
		console.log(files);
		gulp.src(files)
			.pipe(concat(lib.options.output))
			.pipe(cleanCSS())
			.pipe(gulp.dest(lib.options.dest));
		
		console.log(`Output: ${lib.options.dest}/${lib.options.output}`);
	},
	clone: function(lib) {
		console.log(`Building ${lib.path}:`);
		const files = lib.files.map(function(file_glob, i) {
			return `${g.content_path}/${lib.path}/${file_glob}`;
		});
		console.log(files);
		gulp.src(files)
			.pipe(gulp.dest(lib.options.dest));
		
		console.log(`Output: ${lib.options.dest}/`);
	}
}

const page = function(page) {
	let readFileSync = function(path) {
		if(fs.existsSync(path)) {
			return fs.readFileSync(path, 'utf-8');
		}
		return "";
	};
	const head = readFileSync(`${g.content_path}/requires/head.html`);
	const body   = readFileSync(`${g.content_path}/requires/body.html`);
	const footer = readFileSync(`${g.content_path}/requires/footer.html`);

	const page_head = readFileSync(`${g.content_path}/pages/${page}/head.html`);
	const page_body   = readFileSync(`${g.content_path}/pages/${page}/body.html`);
	const page_script = readFileSync(`${g.content_path}/pages/${page}/script.js`);
	const page_style = readFileSync(`${g.content_path}/pages/${page}/style.css`);


	const dirs = page.split('/');
	let dirstr = `${g.output_path}/`;
	dirs.map(function(dir) {
		dirstr += `${dir}/`;
		if(!fs.existsSync(`./${dirstr}`)) {
			console.log(`${g.colors.bright}Creating Directory:${g.colors.bright}${g.colors.yellow}./${dirstr}${g.colors.reset}`);
			fs.mkdirSync(`./${dirstr}`);
		}
	});
	console.log(`${g.colors.bright}Building Page:${g.colors.bright}${g.colors.cyan}./${page}${g.colors.reset}`);


	var pp = function(str, n) {
		// indent every line except first by n		
	}
	fs.writeFileSync(`${g.output_path}/${page}/index.html`,`
<!DOCTYPE html>
<html>
	<head>
		${head}
		<div id="page-head">
			${page_head}
			</div>
	</head>
	<body>
		${body}
		<div id="page-content-body" class="page-content">
			${page_body}
			<style>
				${page_style}
			</style>
			<script>
				${page_script}
			</script>
		</div>
		<footer>
			${footer}
		</footer>
	</body>
</html>
	`);

	fs.writeFileSync(`${g.output_path}/${page}/content.html`,`
<div id="page-content-body" class="page-content">
	${page_body}
	<style>
		${page_style}
	</style>
	<script>
		${page_script}
	</script>
</div>
	`);
};

module.exports = {exec, page};
