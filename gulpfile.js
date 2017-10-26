const output = 'dist',
    gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    injectSVG = require('gulp-inject-svg'),
    replace = require('gulp-replace'),
    fs = require('fs'),
    htmlmin = require('gulp-htmlmin'),
    rename = require("gulp-rename"),
    notify = require('gulp-notify'),
    del = require('del');

function minifyHtml(stream) {
    return stream.pipe(replace(/(href="css\/[^."]+)(.css)/g, '$1.min$2'))
        .pipe(replace(/(src="js\/jquery[-0-9.]+)(.js)/g, '$1.min$2'))
        .pipe(replace(/(src="js\/app)(.js)/g, '$1.min$2'))
        .pipe(htmlmin({
            minifyCSS: true,
            minifyJS: {
                mangle: false,
                compress: false
            },
            removeComments: true
        }))
        .pipe(replace(/(\s*\n){3,}/g, '\n\n'))
        .pipe(gulp.dest(output))
        .pipe(notify({
            message: 'html minified'
        }))
}

gulp.task('styles', () =>
    gulp.src(['src/css/*.css'], {
        base: 'src'
    })
    .pipe(minifycss())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(output))
    .pipe(notify({
        message: 'styles task complete'
    }))
);

gulp.task('scripts', () =>
    gulp.src(['src/js/app.js'], {
        base: 'src'
    })
    .pipe(jshint('.jshintrc'))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(output))
    .pipe(notify({
        message: 'scripts task complete'
    }))

);

gulp.task('index', function () {
    let stream = gulp.src('src/index.html')
        .pipe(injectSVG({
            base: '/src/'
        }))

    return minifyHtml(stream);
});

gulp.task('copy', () =>
    gulp.src(['src/js/jquery*.min.js', 'src/js/knockout*.js'], {
        base: 'src'
    })
    .pipe(gulp.dest(output))
);

gulp.task('clean', function (cb) {
    del(['dist/**']).then(cb())
});

gulp.task('default', function () {
    gulp.start('index', 'styles', 'scripts', 'copy');
});