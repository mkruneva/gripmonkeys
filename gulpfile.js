'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
// var pump = require('pump');
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
        .pipe(gulp.dest('build/assets/images'));
});

// min tex
gulp.task('texmin', function() {
    gulp.src('client/static/assets/tex/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/assets/textures'));
});

// .pipe(imagemin({verbose: true}))

gulp.task('mini', ['imagemin', 'texmin']);

// less to css, minify
gulp.task('css', function() {
    gulp.src('client/static/assets/style/main.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/assets/style'))
        // .pipe(browserSync.reload({ stream: true }));
});

// application.js uglify
gulp.task('jsApp', function() {
    return gulp.src('client/static/assets/js/application/source/application.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/js'));
});

// three.js uglify
gulp.task('uglyThree', function() {
    return gulp.src(['client/static/assets/js/three/orbitCtrls.js',
            'client/static/assets/js/three/Detector.js'
        ])
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/js/three'));
});

gulp.task('concatThree', function() {
    return gulp.src('build/assets/js/three/*.js')
        // .pipe(uglify())
        // .pipe(sourcemaps.init())
        .pipe(concat('three.min.js'))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/assets/js/three'));
});

gulp.task('js', ['jsApp', 'uglyThree']);

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