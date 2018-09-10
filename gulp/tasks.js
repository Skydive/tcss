
const config = require('./config.json');

const fs = require('fs');
const gulp = require('gulp');
const rev_rewrite = require('gulp-rev-rewrite');
const rm = require('gulp-rm');

const processor_list = {
	// add META config options for PROPER DEPLOYMENT build: watch: deploy:
	'pages': require('./proc/html/html.js'),
	'js': require('./proc/js.js'),
	'css': require('./proc/css.js'),
	'clone': require('./proc/clone.js')
};

module.exports = function() {
	// TODO: Add deployment/minifying support
	// TODO: Add revisions
	let deploy_tasks = [];
	let build_tasks = [];
	let watch_tasks = [];
	for(let task_group in config.lib) {
		let task_group_entry = config.lib[task_group];
		let proc = task_group_entry.processor;
		let content = task_group_entry.content;
		let options = task_group_entry.options;
		
		let process_func = processor_list[proc];

		let names = process_func({
			task_group: task_group,
			content: content,
			options: options
		}, config)
		deploy_tasks = deploy_tasks.concat(names.deploy_tasks);
		build_tasks = build_tasks.concat(names.build_tasks);
		watch_tasks = watch_tasks.concat(names.watch_tasks);
	}
	gulp.task('deploy:pre', deploy_tasks);
	gulp.task('build', build_tasks);
	gulp.task('watch', watch_tasks);

	gulp.task('deploy:post', ['deploy:pre'], function() {
		const manifest = gulp.src(`${config.deploy_path}/**/rev-manifest.json`);
		gulp.src(`${config.deploy_path}/**`)
    		.pipe(rev_rewrite({
    			manifest: manifest
    		}))
    		.pipe(gulp.dest(`${config.deploy_path}`));
	});

	gulp.task('deploy', ['deploy:post']);

	let clean_tasks = [];
	let OUT_DIRS = [config.deploy_path, config.build_path];
	OUT_DIRS.map((x) => {
		let clean_task_name = `clean:${x}`;
		gulp.task(clean_task_name, function() {
			gulp.src(`${x}/**`, {read:false}).pipe(rm());
		});
		clean_tasks.push(clean_task_name)
	});
	gulp.task('clean', clean_tasks);

};