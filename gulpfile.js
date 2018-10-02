const gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    imagemin = require('gulp-imagemin'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

const paths = {
    root: './build',
    templates: {
        pages: 'src/templates/pages/*.pug',
        src: 'src/templates/**/*.pug',
        dest: 'build/assest'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'build/assets/styles',
        app: './src/styles/main.scss'
    },
    images: {
        src: 'src/images',
        dest: 'build/assets/images'
    },
    svg: {
        src: 'src/images/icon',
        dest: 'build/assets/images'
    },
    scripts: {
        src: 'src/scripts',
        dest: 'build/assets/scripts'
    },
    libs: {
        src: 'src/libs',
        dest: 'build/assets/scripts'
    },
    fonts: {
        src: 'src/fonts/*.*',
        build: 'build/assets/fonts'
    },
    backend: {
        src: 'src/php/*.*',
        build: 'build'
    }
};

function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src + 'icons', svg);
    gulp.watch(paths.images.src, pic);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.libs.src, libs);
    gulp.watch(paths.fonts.src, fonts);
    gulp.watch(paths.backend.src, php);
}

function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

function clean() {
    return del(paths.root);
}

function scripts() {
    return gulp
        .src(paths.scripts.src + '/**/*.js')
        .pipe(
            babel({
                presets: ['env']
            })
        )
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
}

function libs() {
    return gulp
        .src(paths.libs.src + '/**/*.js')
        .pipe(uglify())
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest(paths.libs.dest));
}

// function templates() {
//     return gulp
//         .src(paths.templates.pages)
//         .pipe(pug({ pretty: true }))
//         .pipe(gulp.dest(paths.root));
// }

function templates() {
    return gulp
        .src(paths.templates.pages)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(function (file) {
            let html = file.contents.toString();
            let selfClosing = ['img', 'input', 'hr', 'br', 'wbr', 'source', 'area', 'col', 'colgroup', 'meta', 'link'];
            html = html.replace(/(<[A-Z][A-Z0-9]*\b[^>]*>)([^<>]*)(<\/[A-Z][A-Z0-9]*>)/gi, function (str, start, content, end) {
                let tag = start.replace(/<|>/gi, '').split(' ')[0];
                return start + ((selfClosing.indexOf(tag) === -1) ? content.trim() : content) + end;
            });
            file.contents = new Buffer(html);
            return paths.root;
        }));
}

function styles() {
    return gulp
        .src(paths.styles.app)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min' }))
        .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
        .pipe(gulp.dest(paths.styles.dest));
}

const config = {
    mode: {
        symbol: {
            sprite: "../sprite.svg",
            example: {
                dest: '../spriteDemo.html'
            }
        }
    }
};

function svg() {
    return gulp.src(paths.svg.src + '/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite(config))
        .pipe(gulp.dest(paths.svg.dest));
};

function fonts() {
    return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.build));
}

function php() {
    return gulp.src(paths.backend.src).pipe(gulp.dest(paths.backend.build));
}

function pic() {
    return gulp
        .src(paths.images.src + '/**/*.{jpg,png}')
        .pipe(
            cache(
                imagemin(
                    [
                        imagemin.gifsicle({ interlaced: true }),
                        imagemin.jpegtran({ progressive: true }),
                        imageminJpegRecompress({
                            loops: 5,
                            min: 65,
                            max: 70,
                            quality: 'medium'
                        }),
                        imagemin.svgo(),
                        imagemin.optipng({ optimizationLevel: 3 }),
                        pngquant({ quality: '65-70', speed: 5 })
                    ],
                    {
                        verbose: true
                    }
                )
            )
        )
        .pipe(gulp.dest(paths.images.dest));
}

gulp.task('clear', function (done) {
    return cache.clearAll(done);
});

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.svg = svg;
exports.scripts = scripts;
exports.libs = libs;
exports.fonts = fonts;
exports.imagemin = imagemin;
exports.imageminJpegRecompress = imageminJpegRecompress;
exports.pngquant = pngquant;
exports.cache = cache;
exports.pic = pic;
exports.php = php;

gulp.task(
    'start',
    gulp.series(
        clean,
        gulp.parallel(styles, templates, svg, scripts, libs, php, fonts, pic),
        gulp.parallel(watch, server)
    )
);

gulp.task(
    'build',
    gulp.series(
        clean,
        gulp.parallel(styles, templates, svg, scripts, libs, php, fonts, pic)
    )
);
