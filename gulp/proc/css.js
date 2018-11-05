const gulp = require('gulp');
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const rev = require('gulp-rev');
const runSequence = require('run-sequence');

function swallow_error(error) {
	console.log(error.toString());
	this.emit('end');
}

module.exports = function(data, config) {
	let deploy_tasks = [];
	let build_tasks = [];
	let watch_tasks = [];
	let task_group = data.task_group;
	let content = data.content;
	let options = data.options;
	for(let group in content) {
		let file_paths = content[group].map((x) => `${config.content_path}/${options.prefix}/${group}/${x}`);

		let deploy_task_name = `deploy:${task_group}:${group}`;
		gulp.task(deploy_task_name, function() {
			return gulp.src(file_paths)
				.pipe(concat(`${group}.min.css`))
				.pipe(cleanCSS())
				.on('error', swallow_error)
				.pipe(rev())
				.pipe(gulp.dest(`${config.deploy_path}/${options.dest}`))
				.pipe(rev.manifest(`${config.deploy_path}/${options.dest}/rev-manifest.json`,{
					base: `${config.deploy_path}/${options.dest}`,
					merge: true
				}))
				.pipe(gulp.dest(`${config.deploy_path}/${options.dest}`));
		});

		let build_task_name = `build:${task_group}:${group}`;
		gulp.task(build_task_name, function() {
			return gulp.src(file_paths)
				.pipe(concat(`${group}.min.css`))
				.on('error', swallow_error)
				.pipe(gulp.dest(`${config.build_path}/${options.dest}`));
		});

		let watch_task_name = `watch:${task_group}:${group}`;
		gulp.task(watch_task_name, function(cb) {
			watch(`${config.content_path}/${options.prefix}/${group}/*`, function() {
				console.log(`${watch_task_name} --> Changed`);
				gulp.start(build_task_name);
			});
			cb();
		});
		deploy_tasks.push(deploy_task_name);
		build_tasks.push(build_task_name);
		watch_tasks.push(watch_task_name);
	}
	gulp.task(`deploy:${task_group}`, (cb) => runSequence(...deploy_tasks, cb));
	gulp.task(`build:${task_group}`, build_tasks);
	gulp.task(`watch:${task_group}`, watch_tasks);

	return {
		deploy_tasks: [`deploy:${task_group}`],
		build_tasks: [`build:${task_group}`],
		watch_tasks: [`watch:${task_group}`]
	};
};