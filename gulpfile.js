var gulp = require('gulp'),
  googleWebFonts = require('gulp-google-webfonts'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  zip=require('gulp-gzip');

gulp.task('fonts', function () {
  var options = {
	fontsDir: 'fonts/',
	cssDir: 'css/',
	cssFilename: 'fonts.css',
  relativePaths: true
  };
	return gulp.src('./src/fonts.list')
		.pipe(googleWebFonts(options))
		.pipe(gulp.dest('dist'))
		;
	});

gulp.task('html-copy',function(){
  return gulp
    .src(['src/index.html'])
    .pipe(htmlmin({
        collapseWhitespace: true
    }))

    .pipe(gulp.dest('./dist/'));
});

gulp.task('css-copy',function(){
  return gulp
    .src([
      'node_modules/daemonite-material/css/material.css'
    ], { base: 'node_modules' })
    .pipe(sourcemaps.init())
    .pipe(concat('main.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(zip({gzipOptions: { level: 9 } }))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('dc-copy',function(){
  return gulp
    .src([
      'node_modules/crossfilter2/crossfilter.js',
      'node_modules/reductio/reductio.js',
      'node_modules/d3/dist/d3.js',
      'node_modules/dc/dc.js'
    ], { base: 'node_modules' })
    .pipe(sourcemaps.init())
    .pipe(concat('dcbundle.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(zip({gzipOptions: { level: 9 } }))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('js-copy',function(){
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/popper.js/dist/umd/popper.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/daemonite-material/js/material.js'
    ], { base: 'node_modules' })
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(zip({gzipOptions: { level: 9 } }))
    .pipe(gulp.dest('./dist/js/'));
});


gulp.task('css-minify',['css-compile'], function() {
    gulp.src(['./dist/css/*.css', '!dist/css/*.min.css'])
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./dist/css'))
      .pipe(zip({gzipOptions: { level: 9 } }))
      .pipe(gulp.dest('./dist/css/'));
});


gulp.task('default', ['fonts','css-copy','js-copy']);

