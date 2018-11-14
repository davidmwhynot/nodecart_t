/*

	title: gulpfile.js
	desc: Gulp task definitions
	author: David Whynot
	email: davidmwhynot@gmail.com
	Project: nodecart_t
	Created: 10/27/18
	Updated: 10/27/18

*/

/* XXX IMPORTS XXX */
// vendor
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const gulp = require('gulp');




/* XXX TASKS XXX */
gulp.task('nodemon', (cb) => {

	var started = false;

	return nodemon({
		script: './bin/www',
		watch: [
			'./app.js',
			'./routes/*.*',
			'./models/*.*',
			'./config/*.*'
		]
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true;
		}
	});
});

gulp.task('browsersync', (done) => {
	console.log('browsersync init...');
	browserSync.init(null, {
		proxy: 'http://localhost:3000',
		files: ['./public/**/*.*', './views/**/*.*'],
		port: 7000
	});
	done();
});



gulp.task('app', gulp.series('nodemon', 'browsersync'));

gulp.task('default', gulp.series('app', () => {
	console.log('default');
}));
