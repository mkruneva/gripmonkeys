'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();


// copy html to build
gulp.task('html', function() {
    gulp.src('client/*.html')
        .pipe(gulp.dest('build'));
});

// min images
gulp.task('imagemin', function() {
    gulp.src('client/static/assets/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/images'));
});

// min tex
gulp.task('texmin', function() {
    gulp.src('client/static/assets/tex/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/textures'));
});

gulp.task('mini', ['imagemin', 'texmin']);

// less to css, minify
gulp.task('css', function() {
    gulp.src('client/static/assets/style/main.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css'))
        // .pipe(browserSync.reload({ stream: true }));
});

// application.js 
gulp.task('js', function() {
    return gulp.src('client/static/assets/js/application/source/application.js')
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/js'));
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('./static/assets/style/**/*.less', ['styles']);
    gulp.watch('./**/*.html').on('change', browserSync.reload());
});

gulp.task('default', ['html', 'mini', 'css', 'js']);