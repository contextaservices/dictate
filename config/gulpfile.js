// generated on 2017-01-05 using generator-kuus-webapp 2.2.0
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const path = require('path');
const browserSync = require('browser-sync');
const lazypipe = require('lazypipe');
const minimist = require('minimist');
const colorsSupported = require('supports-color');
const webpack = require('webpack');

const paths = require('./dev-lib/paths');

const pkg = require('../package.json');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const argv = minimist(process.argv.slice(2));

const clean = require('./dev-lib/gulp/clean');
const images = require('./dev-lib/gulp/images');
const extras = require('./dev-lib/gulp/extras');
const ngComponent = require('./dev-lib/gulp/ng-component');
const deployServer = require('./dev-lib/gulp/deploy');
const ngSvgIcons = require('./dev-lib/gulp/ng-svg-icons');

// Public tasks

gulp.task(serveDist);
gulp.task(ngComponent);
gulp.task('deploy', gulp.series(deployServer, deployGithub));
gulp.task(watch);
gulp.task('build', gulp.series(clean, ngSvgIcons, gulp.parallel(buildWebpack, images, extras/*, styles*/)/*, optimize*/));
gulp.task('serve', gulp.series('build', gulp.parallel(/*views, styles, scripts, modernizr, fonts*/), watch));
gulp.task('default', gulp.task('serve'));


function server (baseDir, routes) {
  browserSync({
    notify: false,
    port: 9000,
    open: (!!argv.o || !!argv.open) || false,
    server: {
      baseDir: baseDir,
      routes: routes
    }
  });
}

function watch () {
  serverWebpack(); // @@extra \\
  // server([`${paths.TEMP}`, `${paths.APP}`]); // @@extra \\

  // watch for changes
  gulp.watch([
    `${paths.TEMP}/*.html`,
    `${paths.SRC}/images/**/*`,
    `${paths.TEMP}/fonts/**/*`
  ]).on('change', reload);

  // gulp.watch([`${paths.APP}/data/*.json`, `${paths.APP}/*.njk`, `${paths.APP}/layouts/**/*.njk`]).on('all', views);
  // gulp.watch(`${paths.CONFIG}/modernizr.json`).on('all', modernizr);
  // gulp.watch(`${paths.APP}/fonts/*.*`).on('all', fonts);
  gulp.watch(`${paths.SRC}/images/icons/**/*.svg`).on('all', ngSvgIcons); // @@extra \\
}

function serveDist() {
  server(`${paths.DIST}`);
}

// use webpack.config.js to build modules
function buildWebpack (cb) {
  const config = require('./dev-lib/webpack/config.dist');
  config.entry.app = paths.ENTRY;

  webpack(config, (err, stats) => {
    if(err)  {
      throw new $.util.PluginError('webpack', err);
    }

    $.util.log('[webpack]', stats.toString({
      colors: colorsSupported,
      chunks: false,
      errorDetails: true
    }));

    cb();

    gulp.src([`${paths.DIST}/**`, `!${paths.DIST}/**/*.map`], {
      base: `${paths.DIST}`,
      buffer: false
    })
    .pipe(gulp.dest(`${paths.TEMP}/.deploy/`));
  });
}

function serverWebpack () {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const historyApiFallback = require('connect-history-api-fallback');
  const config = require('./dev-lib/webpack/config.dev');
  config.entry.app = [
    // this modules required to make HRM working
    // it responsible for all this webpack magic
    'webpack-hot-middleware/client?reload=true',
    // application entry point
  ].concat(paths.ENTRY);

  var compiler = webpack(config);

  browserSync({
    port: process.env.PORT || 3000,
    open: false,
    server: {baseDir: paths.SRC},
    middleware: [
      historyApiFallback(),
      webpackDevMiddleware(compiler, {
        stats: {
          colors: colorsSupported,
          chunks: false,
          modules: false
        },
        publicPath: config.output.publicPath
      }),
      webpackHotMiddleware(compiler)
    ]
  });
}


// const replace = require('gulp-replace');
const ghPages = require('gh-pages');
// const pkg = require('../package.json');

function deployGithub(callback) {
  // gulp.src(paths.join(paths.DIST, '*.html'))
  //   .pipe(replace('<base href="/">', `<base href="/${pkg.name}/">`))
  //   .pipe(gulp.dest(paths.DIST));

  require('replace')({
    regex: '<base href="/">',
    replacement: `<base href="/${pkg.name}/">`,
    paths: [paths.DIST],
    include: '*.html',
    recursive: true,
    silent: true,
  });

  ghPages.publish(paths.DIST, {
    remote: 'github'
  }, callback);
}
gulp.task(deployGithub);