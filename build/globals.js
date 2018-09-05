const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore : "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",

	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",

	bgBlack: "\x1b[40m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
	bgMagenta: "\x1b[45m",
	bgCyan: "\x1b[46m",
	bgWhite: "\x1b[47m"
};

const pages = [
	''
];

const content_path = './content';
const output_path = './www';

const libs = [
	{
		type: 'js',
		options: {
			output: 'vendor.min.js',
			dest: `${output_path}/js`
		},
		path: 'js/vendor',
		files: [
			'jquery-3.3.1.min.js',
			'jquery-ui.min.js',
			'js.cookie-2.2.0.min.js',
			'moment.js'
		]
	},
	{
		type: 'js',
		options: {
			output: 'app.min.js',
			dest: `${output_path}/js`
		},
		path: 'js/app',
		files: [
			'**/*.js'
		]
	},
	{
		type: 'css',
		options: {
			output: 'vendor.min.css',
			dest: `${output_path}/css`
		},
		path: 'css/vendor',
		files: [
			'jquery-ui.theme.min.css',
			'jquery-ui.structure.min.css',
			'jquery-ui.min.css',
			'font-awesome.min.css',
			'animate.min.css'
		]
	},
	{
		type: 'css',
		options: {
			output: 'app.min.css',
			dest: `${output_path}/css`
		},
		path: 'css/app',
		files: [
			'**/*.css'
		]
	},
	{
		type: 'clone',
		options: {
			dest: `${output_path}/php`
		},
		path: 'php',
		files: [
			'**/*.php'
		]
	},
	{
		type: 'clone',
		options: {
			dest: `${output_path}/fonts`
		},
		path: 'fonts',
		files: [
			'**/*.eot',
			'**/*.svg',
			'**/*.ttf',
			'**/*.woff',
			'**/*.woff2'
		]
	}
];

module.exports = {content_path, output_path, colors, pages, libs};
