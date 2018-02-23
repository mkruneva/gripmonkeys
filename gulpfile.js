'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();

gulp.task('styles', function() {
    gulp.src('./static/assets/style/style.less')
        .pipe(less())
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.reload({stream: true}));
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

gulp.task('default', ['styles']);