
const config = require('./config.json');
const build_html = require('./gulp-build_html.js');

const fs = require('fs');
const gulp = require('gulp');
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

const TEMPLATE_INDEX = fs.readFileSync('./build/structure_index.html', 'utf-8');
const TEMPLATE_CONTENT = fs.readFileSync('./build/structure_content.html', 'utf-8');

function swallow_error(error) {
	console.log(error.toString())
	this.emit('end')
}

// TODO: Abuse object extend
const processors = {
	// add META config options for PROPER DEPLOYMENT build: watch: deploy:
	'pages': function(data) {
		// TODO: add config for template <---> output, requires for template
		let build_tasks = [];
		let watch_tasks = [];
		let task_group = data.task_group;
		let content = data.content;
		let options = data.options;

		let requires_paths = options.requires.map((x) => `${config.content_path}/${x}`);
		for(let i in content) {
			let page = content[i];
			let build_task_name = `build:${task_group}:${page}`;
			gulp.task(build_task_name, function() {
				gulp.src([`${config.content_path}/${options.prefix}/${page}/*.html`].concat(requires_paths))
					.pipe(build_html({
						template: TEMPLATE_INDEX,
						base: `${config.content_path}/`,
						output: 'index.html'
					}))
					.pipe(gulp.dest(`${config.output_path}/${options.dest}/${page}`));
				gulp.src([`${config.content_path}/${options.prefix}/${page}/*.html`].concat(requires_paths))
					.pipe(build_html({
						template: TEMPLATE_CONTENT,
						base: `${config.content_path}/`,
						output: 'content.html'
					}))
					.pipe(gulp.dest(`${config.output_path}/${options.dest}/${page}`));
			});
			build_tasks.push(build_task_name);

			let watch_task_name = `watch:${task_group}:${page}`;
			gulp.task(watch_task_name, function() {
				watch(`${config.content_path}/${options.prefix}/${page}/*`, [build_task_name]);
			});
			watch_tasks.push(watch_task_name);
		}
		gulp.task(`build:${task_group}`, build_tasks);
		gulp.task(`watch:${task_group}`, watch_tasks);

		gulp.task('watch:requires', function() {
			watch(`${config.content_path}/${options.prefix}/${page}/*`, `build:${task_group}`);
		});

		return {
			build_tasks: [`build:${task_group}`],
			watch_tasks: [`watch:${task_group}`, 'watch:requires']
		};
	},
	'js': function(data) {
		let build_tasks = [];
		let watch_tasks = [];
		let task_group = data.task_group;
		let content = data.content;
		let options = data.options;
		for(let group in content) {
			let file_paths = content[group].map((x) => `${config.content_path}/${options.prefix}/${group}/${x}`);
			let build_task_name = `build:${task_group}:${group}`;
			gulp.task(build_task_name, function() {
				gulp.src(file_paths)
					.pipe(concat(`${group}.min.js`))
					.pipe(uglify())
					.on('error', swallow_error)
					.pipe(gulp.dest(`${config.output_path}/${options.dest}`));
			});
			let watch_task_name = `watch:${task_group}:${group}`;
			gulp.task(watch_task_name, function() {
				watch(`${config.content_path}/${options.prefix}/${group}/*`, [build_task_name]);
			});
			build_tasks.push(build_task_name);
			watch_tasks.push(watch_task_name);
		}
		gulp.task(`build:${task_group}`, build_tasks);
		gulp.task(`watch:${task_group}`, watch_tasks);

		return {
			build_tasks: [`build:${task_group}`],
			watch_tasks: [`watch:${task_group}`]
		};
	},
	'css': function(data) {
		let build_tasks = [];
		let watch_tasks = [];
		let task_group = data.task_group;
		let content = data.content;
		let options = data.options;
		for(let group in content) {
			let file_paths = content[group].map((x) => `${config.content_path}/${options.prefix}/${group}/${x}`);
			let build_task_name = `build:${task_group}:${group}`;
			gulp.task(build_task_name, function() {
				gulp.src(file_paths)
					.pipe(concat(`${group}.min.css`))
					.pipe(cleanCSS())
					.on('error', swallow_error)
					.pipe(gulp.dest(`${config.output_path}/${options.dest}`));
			});
			let watch_task_name = `watch:${task_group}:${group}`;
			gulp.task(watch_task_name, function() {
				watch(`${config.content_path}/${options.prefix}/${group}/*`, [build_task_name]);
			});
			build_tasks.push(build_task_name);
			watch_tasks.push(watch_task_name);
		}
		gulp.task(`build:${task_group}`, build_tasks);
		gulp.task(`watch:${task_group}`, watch_tasks);

		return {
			build_tasks: [`build:${task_group}`],
			watch_tasks: [`watch:${task_group}`]
		};
	}, // TODO: remove static folder from src - replace with img?
	'clone': function(data) {
		let task_group = data.task_group;
		let content = data.content;
		let options = data.options;

		let file_paths = content.map((x) => `${config.content_path}/${options.prefix}/${x}`);
		let build_task_name = `build:${task_group}`;
		gulp.task(build_task_name, function() {		
			gulp.src(file_paths)
				.pipe(gulp.dest(`${config.output_path}/${options.dest}`));
		});

		let watch_task_name = `watch:${task_group}`;
		gulp.task(watch_task_name, function() {
			watch(`${config.content_path}/${options.prefix}/*`, [build_task_name]);
		});

		return {
			build_tasks: [build_task_name],
			watch_tasks: [watch_task_name]
		};
	}
};

module.exports = function() {
	// TODO: Add deployment/minifying support
	// TODO: Add revisions
	let build_tasks = [];
	let watch_tasks = [];
	for(let task_group in config.lib) {
		let task_group_entry = config.lib[task_group];
		let processor = task_group_entry.processor;
		let content = task_group_entry.content;
		let options = task_group_entry.options;

		let names = processors[processor]({
			task_group: task_group,
			content: content,
			options: options
		})
		build_tasks = build_tasks.concat(names.build_tasks);
		watch_tasks = watch_tasks.concat(names.watch_tasks);
	}

	// TODO: parralelise
	gulp.task('build', build_tasks);
	// TODO: debug watch
	gulp.task('watch', watch_tasks);
};

