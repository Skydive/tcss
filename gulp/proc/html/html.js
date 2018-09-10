const gulp = require('gulp');
const watch = require('gulp-watch');
const htmlmin = require('gulp-htmlmin');

const build_html = require('./build.js');

const fs = require('fs');
const TEMPLATE_INDEX = fs.readFileSync(require.resolve('./structure_index.html'), 'utf-8');
const TEMPLATE_CONTENT = fs.readFileSync(require.resolve('./structure_content.html'), 'utf-8');

module.exports = function(data, config) {
	// TODO: add config for template <---> output, requires for template
	let deploy_tasks = [];
	let build_tasks = [];
	let watch_tasks = [];
	let task_group = data.task_group;
	let content = data.content;
	let options = data.options;

	let requires_paths = options.requires.map((x) => `${config.content_path}/${x}`);
	for(let i in content) {
		let page = content[i];

		let deploy_task_name = `deploy:${task_group}:${page}`;
		gulp.task(deploy_task_name, function() {
			let src = gulp.src([`${config.content_path}/${options.prefix}/${page}/*.html`].concat(requires_paths));
			let streams = [{
				template: TEMPLATE_INDEX,
				output: 'index.html'
			},{
				template: TEMPLATE_CONTENT,
				output: 'content.html'
			}].map((x) => src.pipe(build_html({
					template: x.template,
					base: `${config.content_path}/`,
					output: x.output
				})));
			let min_streams = streams.map((s) => 
				s.pipe(htmlmin({
					collapseWhitespace: true,
					minifyCSS: true,
					minifyJS: true
				})));
			min_streams.map((s) => s.pipe(
	        		gulp.dest(`${config.deploy_path}/${options.dest}/${page}`)
	        	));
		});

		let build_task_name = `build:${task_group}:${page}`;
		gulp.task(build_task_name, function() {
			let src = gulp.src([`${config.content_path}/${options.prefix}/${page}/*.html`].concat(requires_paths));
			let streams = [{
				template: TEMPLATE_INDEX,
				output: 'index.html'
			},{
				template: TEMPLATE_CONTENT,
				output: 'content.html'
			}].map((x) => src.pipe(build_html({
					template: x.template,
					base: `${config.content_path}/`,
					output: x.output
				})));
			streams.map((s) => s.pipe(
	        		gulp.dest(`${config.build_path}/${options.dest}/${page}`)
	        	));
		});
		let watch_task_name = `watch:${task_group}:${page}`;
		gulp.task(watch_task_name, function() {
			watch(`${config.content_path}/${options.prefix}/${page}/*`, [build_task_name]);
		});

		deploy_tasks.push(deploy_task_name);
		build_tasks.push(build_task_name);
		watch_tasks.push(watch_task_name);
	}
	gulp.task(`deploy:${task_group}`, deploy_tasks);
	gulp.task(`build:${task_group}`, build_tasks);
	gulp.task(`watch:${task_group}`, watch_tasks);

	gulp.task('watch:requires', function() {
		watch(`${config.content_path}/${options.prefix}/${page}/*`, `build:${task_group}`);
	});

	return {
		deploy_tasks: [`deploy:${task_group}`],
		build_tasks: [`build:${task_group}`],
		watch_tasks: [`watch:${task_group}`, 'watch:requires']
	};
};