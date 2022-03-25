


// dont' forget config stuff in settings.local.php

'use strict';
var beep = require('beepbeep')
var git = require('gulp-git');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var sassGlob = require('gulp-sass-glob');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var runSequence = require('gulp4-run-sequence');
var rename = require('gulp-rename');
var plumber = require ('gulp-plumber');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var sassLint = require('gulp-sass-lint');
var svgmin = require('gulp-svgmin');



/* ----------------------------- */
/*         Configuration         */
/* ----------------------------- */



// Config defaults.
var config = {
  proxyTarget: undefined
};

/*
 * Configuration Overrides
 * Include local file for overriding config, don't fail if it doesn't exist.
 */
try {
  config = require('./config.json');
} catch (error) {

}

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
  beep();
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
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
};

gulp.task('sass', gulp.series(sassBuild));


/*
 * JS compile task
 * Compiles js in src() to dest()
 * Run JS through Babel.
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

gulp.task('js', gulp.series(jsBuild));

/*
* Move image assets task
* Moves images in src() to dest()
*/

var imageBuild = function() {
  return gulp.src('src/img/**/*.!(svg)')
    .pipe(gulp.dest('dist/img'));
};

var svgBuild = function() {
  return gulp.src('src/img/**/*.svg')
    .pipe(svgmin({
      plugins: [{
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest('dist/img'));
};

gulp.task('pixelimages', gulp.series(imageBuild));
gulp.task('svg', gulp.series(svgBuild));

gulp.task('images', gulp.parallel('pixelimages', 'svg'));


/*
* Move font assets task
* Moves fonts in src() to dest()
*/

var fontBuild = function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
};

gulp.task('fonts', gulp.series(fontBuild));


/**
 * Generates Pattern Lab front-end.
 */

// if (patternlab) {
//   gulp.task('pl:generate', function () {
//       return run('php ' + config.patternLab.dir + '/core/console --generate').exec();
//   });
// }


/**
 * Calls BrowserSync reload.
 */

gulp.task('bs:reload', function () {
  browserSync.reload();
});

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}




/* ----------------------------- */
/* Watch */
/* ----------------------------- */



/*
* Watch Task
* Watches for changes in the directories defined
* runs tasks depending on directory changed
*/

gulp.task('watch', function() {
  const isDevInstance = process.env.DOCKER_DEV_ENV || false;

  const browserSyncConfig = {
    proxy: {
      target: config.proxyTarget
    },
    open: true,
    notify: false
  };

  if (isDevInstance) {
    browserSyncConfig.proxy.target = 'http://php';
    browserSyncConfig.port = 8080;
    browserSyncConfig.open = false;
    browserSyncConfig.ui = false;
    browserSyncConfig.callbacks = {
      ready: function() {
        console.log('\x1b[44m\n');
        console.log(`  View site at: ${process.env.BASE_URL}:8080  `);
        console.log('\x1b[0m\n');
      }
    };
  }

  browserSync.init(browserSyncConfig);

  gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
  gulp.watch('src/scripts/js/**/*.js', gulp.series('js'));
  gulp.watch('src/img/**/*', gulp.series('images'));
  gulp.watch('src/fonts/**/*', gulp.series('fonts'));
});




/* ----------------------------- */
/* Other */
/* ----------------------------- */



// Lint Sass

gulp.task('lint-sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    // .pipe(sassLint.failOnError())
});


// Recompile Sass and git add the files.

gulp.task('fix-css', function() {
  return sassBuild().pipe(git.add());
});


// Recompile JS and git add the files.
// Wait until fixcss runs, we don't want two git add operations happening at the
// same time.
// @todo Combine streams.

gulp.task('fix-js', gulp.series('fix-css', function() {
  return jsBuild().pipe(git.add());
}));

// Git rebase, fixcss and fixjs have to be completed first.

gulp.task('rebase-continue', gulp.series('fix-css', 'fix-js', function() {
  git.exec({
    args: 'rebase --continue'
  });
}));

gulp.task('fix', gulp.series('fix-css', 'fix-js', 'rebase-continue'));


// Server Tasks

gulp.task('default', function(done) {
  runSequence('watch', done);
});



/* ///////////////////////////// */
/*             BUILDS            */
/* ///////////////////////////// */



// Delete all files in dist directory in prep for final build

gulp.task('clean', function(done) {
  return del([
      './dist/**/*'
  ]).then(paths => {
    console.log('Deleted files and folders: \n', paths.join('\n'));
  });
});


//  Build All Task for production

gulp.task('build-raw', function(done){

  // rebuild pixel based images and minify
  gulp.src('src/img/**/*.!(svg)')
    .pipe(gulp.dest('dist/img/'));

  // rebuild SVG images and minify
  gulp.src('src/img/**/*.svg')
    .pipe(svgmin({
      plugins: [{
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest('dist/img'));

  // rebuild fonts
  gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

  // rebuild css
  gulp.src('src/sass/**/*.scss')
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist/css'));

  // rebuild and uglify js
  gulp.src('src/scripts/js/**/*.js')
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }))
    .pipe(gulp.dest('dist/scripts/js'));

  done();
});


//  Build All Task for production

gulp.task('build-all', function(done){

  // rebuild pixel based images and minify
  gulp.src('src/img/**/*.!(svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/'));

  // rebuild SVG images and minify
  gulp.src('src/img/**/*.svg')
    .pipe(svgmin({
      plugins: [{
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest('dist/img'));

  // rebuild fonts
  gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

  // rebuild css
  gulp.src('src/sass/**/*.scss')
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist/css'));

  // rebuild and uglify js
  gulp.src('src/scripts/js/**/*.js')
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/js'));
  done();
});


// Clean out all assets and re-compile them for Development

gulp.task('build-raw', gulp.series('clean', 'build-raw'));


// Clean out all assets and re-compile them for Production

gulp.task('build', gulp.series('clean', 'build-all'));
