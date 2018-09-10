
const config = require('./config.json');

const fs = require('fs');
const gulp = require('gulp');
const revRewrite = require('gulp-rev-rewrite');

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

	gulp.task('deploy:post', ['deploy:pre'], function() {
		const manifest = gulp.src(`${config.deploy_path}/**/rev-manifest.json`);
		gulp.src(`${config.deploy_path}/**`)
    		.pipe(revRewrite({
    			manifest: manifest
    		}))
    		.pipe(gulp.dest(`${config.deploy_path}`));
	});

	// TODO: parralelise
	gulp.task('deploy:pre', deploy_tasks);



	gulp.task('deploy', ['deploy:post']);
	gulp.task('build', build_tasks);
	// TODO: debug watch
	gulp.task('watch', watch_tasks);
};

