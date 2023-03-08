


// dont' forget config stuff in settings.local.php

'use strict';
var beep = require('beepbeep');
var git = require('gulp-git');
var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var sassGlob = require('gulp-sass-glob');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var pipeline = require('readable-stream').pipeline;
var browserSync = require('browser-sync').create();
var runSequence = require('gulp4-run-sequence');
var rename = require('gulp-rename');
var plumber = require ('gulp-plumber');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var sassLint = require('gulp-sass-lint');
var webpackStream = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');


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
    .pipe(sass({
      includePaths: ['node_modules', 'vendor']
    }))
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
  return gulp.src('src/scripts/js/**/*.js', '!src/scripts/js/**/*.webpack.js')
             .pipe(plumber({
               errorHandler: onError
             }))
             .pipe(babel({
               presets: ['@babel/preset-env'],
               ignore: [
                 "src/scripts/js/vendor",
               ]
             }))
             .pipe(rename(function (path) {
               path.basename += ".min";
               path.extname = ".js";
             }))
             .pipe(gulp.dest('dist/scripts/js'));
};

var jsWebpackBuild = function() {
  return gulp.src('src/scripts/js/**/*.webpack.js')
             .pipe(webpackStream(webpackConfig, null, function(err, stats) {
               /* Use stats to do more things if needed */
             })).on('error',function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })
             .pipe(gulp.dest('dist/scripts/js'));
};

gulp.task('js', gulp.series(jsBuild, jsWebpackBuild));
gulp.task('webpackJS', gulp.series(jsWebpackBuild));


/*
* Move image assets task
* Moves images in src() to dest()
*/

var imageBuild = function() {
  return gulp.src('src/img/**/*')
             .pipe(gulp.dest('dist/img'));
};

gulp.task('images', gulp.series(imageBuild));


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

  const isLandoInstance = process.env.LANDO || false;

  let browserSyncConfig = {
    proxy: {
      target: config.proxyTarget
    },
    open: true,
    notify: false
  };

  if (isLandoInstance === 'ON') {
    // Check for environment variable set in .lando.yml
    if ('BROWSER_SYNC_PROXY_TARGET' in process.env) {
      browserSyncConfig.proxy.target = process.env.BROWSER_SYNC_PROXY_TARGET;
      browserSyncConfig.open         = false;
      browserSyncConfig.ui           = false;
      browserSyncConfig.callbacks    = {
        ready: function () {
          console.log('\x1b[44m\n');
          console.log(`  View site at: ${process.env.BROWSER_SYNC_PROXY_TARGET} `);
          console.log('\x1b[0m\n');
        }
      };
    }
    else {
      browserSyncConfig = null;
    }
  }

  if (browserSyncConfig) {
    browserSync.init(browserSyncConfig);
  }

  gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
  gulp.watch(['src/scripts/js/**/*.js', '!src/scripts/js/**/*.webpack.js'], gulp.series('js'));
  gulp.watch('src/scripts/js/**/*.webpack.js', gulp.series('webpackJS'));
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
  gulp.src('src/img/**/*')
      .pipe(gulp.dest('dist/img/'));

  // rebuild fonts
  gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));

  // rebuild css
  gulp.src('src/sass/**/*.scss')
      .pipe(sassGlob())
      .pipe(sass({
        includePaths: ['node_modules', 'vendor']
      }))
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/css'));

  gulp.src('src/scripts/js/**/*.webpack.js')
      .pipe(webpackStream(webpackConfig, null, function(err, stats) {
        /* Use stats to do more things if needed */
      })).on('error',function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end'); // Don't stop the rest of the task
      })
      .pipe(gulp.dest('dist/scripts/js'));

  // rebuild and uglify js
  return pipeline(
    gulp.src(['src/scripts/js/**/*.js', '!src/scripts/js/**/*.webpack.js']),
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            'modules': false
          }
        ]
      ],
      ignore: [
        "src/scripts/js/vendor",
      ]
    }),
    rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }),
    uglify(),
    gulp.dest('dist/scripts/js')
  );

  done();
});


//  Build All Task for production

gulp.task('build-all', function(done){

  // rebuild pixel based images and minify
  gulp.src('src/img/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('dist/img/'));

  // rebuild fonts
  gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));

  // rebuild css
  gulp.src('src/sass/**/*.scss')
      .pipe(sassGlob())
      .pipe(sass({
        includePaths: ['node_modules', 'vendor']
      }))
      .pipe(autoprefixer())
      .pipe(gulp.dest('dist/css'));

  gulp.src('src/scripts/js/**/*.webpack.js')
      .pipe(webpackStream(webpackProdConfig, null, function(err, stats) {
        /* Use stats to do more things if needed */
      })).on('error',function (err) {
        console.error('WEBPACK ERROR', err);
        this.emit('end'); // Don't stop the rest of the task
      })
      .pipe(gulp.dest('dist/scripts/js'));

  // rebuild and uglify js
  return pipeline(
    gulp.src(['src/scripts/js/**/*.js', '!src/scripts/js/**/*.webpack.js']),
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            'modules': false
          }
        ]
      ],
      ignore: [
        "src/scripts/js/vendor",
      ]
    }),
    rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }),
    uglify(),
    gulp.dest('dist/scripts/js')
  );

  done();
});


// Clean out all assets and re-compile them for Development

gulp.task('build-raw', gulp.series('clean', 'build-raw'));


// Clean out all assets and re-compile them for Production

gulp.task('build', gulp.series('clean', 'build-all'));
