const gulp = require('gulp');
const watch = require('gulp-watch');
const rev = require('gulp-rev');

module.exports = function(data, config) {
	let task_group = data.task_group;
	let content = data.content;
	let options = data.options;
	let file_paths = content.map((x) => `${config.content_path}/${options.prefix}/${x}`);

	let deploy_task_name = `deploy:${task_group}`;
	gulp.task(deploy_task_name, function() {
		let revision = 'revision' in options && options.revision;
		let flow = gulp.src(file_paths);
		if(revision) {
			flow = flow.pipe(rev());
		}
		flow = flow.pipe(gulp.dest(`${config.deploy_path}/${options.dest}`));
		if(revision) {
			flow = flow.pipe(rev.manifest(`${config.deploy_path}/${options.dest}/rev-manifest.json`,{
					base: `${config.deploy_path}/${options.dest}`,
					merge: true
				}))
				.pipe(gulp.dest(`${config.deploy_path}/${options.dest}`));
		}
	});

	let build_task_name = `build:${task_group}`;
	gulp.task(build_task_name, function() {		
		gulp.src(file_paths)
			.pipe(gulp.dest(`${config.build_path}/${options.dest}`));
	});

	let watch_task_name = `watch:${task_group}`;
	gulp.task(watch_task_name, function() {
		watch(`${config.content_path}/${options.prefix}/*`, [build_task_name]);
	});

	return {
		deploy_tasks: [deploy_task_name],
		build_tasks: [build_task_name],
		watch_tasks: [watch_task_name]
	};
};