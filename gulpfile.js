const fs = require('fs');

const gulp = require('gulp');
const watch = require('gulp-watch');

const g = require('./build/globals.js');
const build = require('./build/build.js');

gulp.task('build', function() {
	g.libs.map(function(lib) {
		build.exec[lib.type](lib);
	});
	for(let i in g.pages) {
		build.page(g.pages[i]);
	}
});


gulp.task('watch', function() {
	const gazers = [].concat.apply([], g.libs.map(function(lib) {
		let watcher = watch(lib.files.map((x) => `${g.content_path}/${lib.path}/${x}`), {
			ignoreInitial: false
		});
		console.log(`${g.colors.bright}New Gazer:${g.colors.cyan}${lib.path}${g.colors.reset}`);
		watcher.on('change', function(vinyl) {
			console.log(`Edited: ${vinyl}`);
			build.exec[lib.type](lib);
		});
		return watcher;
	}));

	for(let i in g.pages) {
		let page = g.pages[i];
		let watcher = watch(`${g.content_path}/pages/${page}/*`,{
			ignoreInitial: false
		});
		console.log(`${g.colors.bright}New Gazer:${g.colors.cyan}${g.content_path}/pages/${page}${g.colors.reset}`);
		watcher.on('change', function(data) {
			build.page(page);
		});
	}

	let watcher = watch(`${g.content_path}/requires/*`,{
		ignoreInitial: false
	});
	console.log(`${g.colors.bright}New Gazer:${g.colors.cyan}${g.content_path}/requires/${g.colors.reset}`);
	watcher.on('change', function(data) {
		for(let i in g.pages) {
			build.page(g.pages[i]);
		}
	});
});

