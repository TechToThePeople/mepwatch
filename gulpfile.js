const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const browserSync = require('browser-sync').create();
const plugins = require('./src/js/modules.js');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');

// CSS Tasks
gulp.task('css',['css-compile','css-minify']);
gulp.task('css-compile', function() {
  gulp.src('src/scss/**/*.scss')
    .pipe(sass({outputStyle: 'nested'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 10 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('fonts',function(){
  return gulp
    .src(['node_modules/font-awesome/fonts/*'])
    .pipe(gulp.dest('./dist/fonts/'));
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
    .src(['node_modules/font-awesome/css/font-awesome.css'])
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('css-minify',['css-compile'], function() {
    gulp.src(['./dist/css/*.css', '!dist/css/*.min.css'])
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./dist/css'))
});

gulp.task('js',['js-build','js-minify']);

// JavaScript Tasks
gulp.task('js-build', function() {
  gulp.src(plugins.modules)
    .pipe(concat('mdb.js'))
    .pipe(gulp.dest('./dist/js/'))
});

gulp.task('js-minify',['js-build'], function() {
  gulp.src('./dist/js/mdb.js')
    .pipe(minify({
      ext:{
        // src:'.js',
        min:'.min.js'
      },
      noSource: true,
    }))
    .pipe(gulp.dest('./dist/js'));
});

// Image Compression
gulp.task('img-compression', function() {
  gulp.src('./src/img/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('./dist/img'));
});

// Live Server
gulp.task('live-server', function() {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index:"index.html",
      directory: true
    },
    notify: true
  });

  gulp.watch("**/*", {cwd: './dist/'}, browserSync.reload);
});

// Watch on everything
gulp.task('mdb-go', function() {
  gulp.start('live-server');
  gulp.watch("src/scss/**/*.scss", ['css-compile']);
  gulp.watch(["dist/css/*.css", "!dist/css/*.min.css"], ['css-minify']);
  gulp.watch("src/js/**/*.js", ['js-build']);
  gulp.watch("dist/js/mdb.js", ['js-minify']);
  gulp.watch("src/*.html", ['html-copy']);
  gulp.watch("**/*", {cwd: './img/'}, ['img-compression']);
});

gulp.task('default', ['css','js']);
