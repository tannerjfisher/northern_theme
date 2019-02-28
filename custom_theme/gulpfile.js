
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var sassGlob = require('gulp-sass-glob');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var plumber = require ('gulp-plumber');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');



/* ----------------------------- */
/*         Configuration         */
/* ----------------------------- */



// Config defaults.
var config = {
  proxyTarget: undefined
};

config.drupal = {
  templatesDir: 'templates'
};

// Helper functions.
function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  }
  catch (err) {
    return false;
  }
}

/*
 * Error Reporting
 * Report errors but keep on gulpin'.
 */
var onError = function (err) {
  gutil.beep();
  console.log(err.messageFormatted);
  this.emit('end'); // super crit
};



/* ----------------------------- */
/* Begin Development Gulp Tasks  */
/* ----------------------------- */



/*
 * SCSS compile task
 * Compiles scss files set in src() to dest()
 */

var sassBuild = function() {
  return gulp
    .src('src/sass/**/*.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init({largeFile: true}))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/css'));
};

gulp.task('sass', sassBuild);


/*
 * JS compile task
 * Compiles js in src() to dest()
 * Suffix .min.js to filename
 */

var jsBuild = function() {
  return gulp.src('src/scripts/js/**/*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest('dist/scripts/js'));
};

gulp.task('js', jsBuild);


/*
* Move image assets task
* Moves images in src() to dest()
*/

var imageBuild = function() {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'));
};

gulp.task('images', imageBuild);


/*
* Move font assets task
* Moves fonts in src() to dest()
*/

var fontBuild = function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
};

gulp.task('fonts', fontBuild);




/* ----------------------------- */
/* Watch */
/* ----------------------------- */



/*
* Watch Task
* Watches for changes in the directories defined
* runs tasks depending on directory changed
*/

gulp.task('watch', function() {
  browserSync.init({
    proxy: {
      target: config.proxyTarget
    },
    open: true
  });
  gulp.watch('src/sass/**/*.scss', ['sass']);
  gulp.watch('src/scripts/js/**/*.js', ['js']);
  gulp.watch('src/img/**/*', ['images']);
  gulp.watch('src/fonts/**/*', ['fonts']);
});




/* ----------------------------- */
/* Other */
/* ----------------------------- */


// Server Tasks

gulp.task('default', function(callback) {
  runSequence('watch',callback);
});

