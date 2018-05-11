const gulp = require('gulp'),
      pug = require('gulp-pug'),
      sass = require('gulp-sass'),
      rename = require('gulp-rename'),
      sourcemaps = require('gulp-sourcemaps'),
      del = require('del'),
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync').create(),
      gulpWebpack = require('gulp-webpack'),
      webpack = require('webpack'),
      webpackConfig = require('./webpack.config.js'),
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
    dest: 'build/assets/styles/',
    app: './src/styles/main.scss'
  },
  images: {
    src: 'src/images/',
    dest: 'build/assets/images/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'build/assets/scripts/'
  },
  fonts: {
    src: 'src/fonts/*.*',
    build: 'build/assets/fonts'
  }
}

function watch() {
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.templates.src, templates)
  gulp.watch(paths.images.src + 'icons', svg)
  gulp.watch(paths.images.src, pic)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.fonts.src, fonts)
}

function server() {
  browserSync.init({
    server: paths.root
  });
  browserSync.watch(paths.root + '/**/*.*', browserSync.reload)
}

function clean() {
  return del(paths.root)
}

function scripts() {
  return gulp.src('src/scripts/app.js')
      .pipe(gulpWebpack(webpackConfig, webpack)) 
      .pipe(gulp.dest(paths.scripts.dest));
}

function templates() {
  return gulp.src(paths.templates.pages)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.root))
}

function styles() {
  return gulp.src(paths.styles.app)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(gulp.dest(paths.styles.dest))
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
  return gulp.src('src/images/icons/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite(config))
    .pipe(gulp.dest('build/assets/images/svg'));
};

function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.build))
}

function pic() {
  return gulp.src('src/images/*.*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality:'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: '65-70', speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest('build/assets/images'));
};

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.svg = svg;
exports.scripts = scripts;
exports.fonts = fonts;
exports.imagemin = imagemin;
exports.imageminJpegRecompress = imageminJpegRecompress;
exports.pngquant = pngquant;
exports.cache = cache;
exports.pic = pic;

gulp.task('start', 
  gulp.series(
    clean,
    gulp.parallel(
      styles, templates, svg, scripts, fonts, pic
    ),
    gulp.parallel(
      watch, server
    )
))