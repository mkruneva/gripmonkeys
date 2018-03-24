'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();

var jasmine = require('gulp-jasmine');
var Server = require('karma').Server;
var cover = require('gulp-coverage');
var istanbul = require('gulp-istanbul');


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


// TESTS
gulp.task('test-single', function() {
    return gulp.src('./specs/**.js')
        .pipe(jasmine());
});

gulp.task('test-watch', function() {
    gulp.watch(['./specs/**.js', 'client/static/assets/js/**.js'], ['test']);
});

gulp.task('test', ['test-single', 'test-watch']);

gulp.task('test-cover', function() {
    return gulp.src('./client/static/assets/js/three/threejsFingerboard.js')
        // Right there
        .pipe(istanbul({ includeUntested: true }))
        .on('finish', function() {
            gulp.src('./specs/**.js')
                .pipe(jasmine())
                .pipe(istanbul.writeReports({
                    dir: './build/unit-test-coverage',
                    reporters: ['lcov'],
                    reportOpts: { dir: './build/unit-test-coverage' }
                }));
        });
});

gulp.task('tests', function(done) {
    new Server({
        configFile: '../karma.conf.js',
        singleRun: false
    }, done).start();
});