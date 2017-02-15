var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

// Basic usage
gulp.task('browserify', function() {
  // Single entry point to browserify
  gulp.src('src/protocol/index.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: !gulp.env.production
    }))
    .pipe(rename('sensorium.js'))
    .pipe(gulp.dest('browser/'))
});