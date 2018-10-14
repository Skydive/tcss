const gulp = require('gulp');
const watch = require('gulp-watch');
const htmlmin = require('gulp-htmlmin');

const cheerio = require('cheerio');

const fs = require('fs');
const path = require('path');

const {build_html, parse_template} = require('./build.js');

module.exports = function(data, config) {
	// TODO: add config for template <---> output, requires for template
	let deploy_tasks = [];
	let build_tasks = [];
	let watch_tasks = [];
	let task_group = data.task_group;
	let content = data.content;
	let options = data.options;

	for(let i in content) {
		let page = content[i];
		let base_dir = `${config.content_path}/${options.prefix}/${page}/`;
		// TODO: fix callbacks to prevent race conditions
		// LOCATE TEMPLATE:
		let template_path = "";
		let template_dirname = `${config.content_path}/${options.prefix}/${page}`;
		while(template_dirname !== `${config.content_path}/${options.prefix}`) {
			if(fs.existsSync(`${template_dirname}/template.html`)) {
				template_path = `${template_dirname}/template.html`;
				break;
			}
			template_dirname = path.normalize(`${template_dirname}/..`);
		}
		if(template_path === "") {
			template_path = `${config.content_path}/${options.prefix}/template.html`;
		}

		let deploy_task_name = `deploy:${task_group}:${page}`;
		gulp.task(deploy_task_name, function() {
			gulp.src(template_path)
				.pipe(build_html({
					base: base_dir,
					content_path: config.content_path
				}))
				.pipe(htmlmin({
					collapseWhitespace: true,
					minifyJS: true,
					minifyCSS: true,
					removeComments: true
				}))
				.pipe(gulp.dest(`${config.deploy_path}/${options.dest}/${page}`));
		});

		let build_task_name = `build:${task_group}:${page}`;
		gulp.task(build_task_name, function() {
			gulp.src(template_path)
				.pipe(build_html({
					base: base_dir,
					content_path: config.content_path
				}))
				.pipe(gulp.dest(`${config.build_path}/${options.dest}/${page}`));
		});

		let watch_files = [template_path];
		parse_template(fs.readFileSync(template_path)).filter(x => x.command === "import").map(function(x) {
			let src = x.args;
			if(src[0] === "/") {
				src = path.join(`${config.content_path}`, src.substr(1, src.length));
			} else {
				src = path.join(`${base_dir}`, src);
			}
			watch_files.push(src);
		})

		let watch_task_name = `watch:${task_group}:${page}`;
		gulp.task(watch_task_name, function(cb) {
			watch(watch_files, function() {
				console.log(`${watch_task_name} --> Changed`);
				gulp.start(build_task_name);
			});
			cb();
		});

		deploy_tasks.push(deploy_task_name);
		build_tasks.push(build_task_name);
		watch_tasks.push(watch_task_name);
	}
	gulp.task(`deploy:${task_group}`, deploy_tasks);
	gulp.task(`build:${task_group}`, build_tasks);
	gulp.task(`watch:${task_group}`, watch_tasks);
	return {
		deploy_tasks: [`deploy:${task_group}`],
		build_tasks: [`build:${task_group}`],
		watch_tasks: [`watch:${task_group}`]
	};
};