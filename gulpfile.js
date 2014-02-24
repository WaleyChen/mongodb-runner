var gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserify = require('gulp-browserify'),
  jade = require('gulp-jade'),
  concat = require('gulp-concat'),
  manifest = require('gulp-sterno-manifest'),
  juice = require('gulp-juice'),
  mongodbProxy = require('mongodb-rest-proxy'),
  ltld = require('local-tld-lib');

gulp.task('js', function(){
  gulp.src('./app/index.js')
    .pipe(browserify({
      debug : false,
      transform: ['jadeify']
    }))
    .pipe(gulp.dest('./.build'));
});

// Jam all the various MMS stylesheets and our overrides into one css file
gulp.task('css', function(){
  gulp.src('./app/css/*.css')
    .pipe(concat('index.css'))
    .pipe(gulp.dest('./.build'));
});

gulp.task('copyAssets', function(){
  gulp.src(['./app/{img,fonts}/*'])
    .pipe(gulp.dest('./.build/'));
});

// Set up watchers to reprocess CSS and JS when files are changed
gulp.task('watch', function (){
  gulp.watch(['./app/{*,**/*}.{js,jade}',], ['js']);
  gulp.watch(['./app/css/*.css'], ['css']);
  gulp.watch(['./app/templates/index.jade'], ['pages']);
  gulp.watch(['./app/{img,fonts}/*'], ['copyAssets']);
});

// Compile the html container template
gulp.task('pages', function(){
  gulp.src('./app/templates/{index,bootloader}.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./.build/'));
});

// Treat `./static` as our web root and serve things up locally on port 3000
gulp.task('serve', function(){
  var port = ltld.getPort('mongoscope') || 3000;
  require('http').createServer(
    require('ecstatic')({ root: __dirname + '/.build' })
  ).listen(port);

  gutil.log('scope running at', 'http://mongoscope.dev/');
});

gulp.task('mongod', function(){
  var mongod = process.env.MONGOD || '/srv/mongo/bin/mongod',
    dbpath = process.env.DBPATH || '/srv/mongo/data/',
    cmd = mongod + ' --dbpath ' + dbpath + ' --rest';

  gutil.log('starting mongod `' + cmd + '`');

  require('child_process').exec(cmd);
  mongodbProxy.listen(mongodbProxy.port, function(){
    gutil.log('mongo api proxy running on', mongodbProxy.port);
  });
});

gulp.task('bootloader', function(){
  gulp.src('./app/bootloader.js')
    .pipe(browserify({debug : false}))
    .pipe(gulp.dest('./.build/'));

  gulp.src(['./app/css/bootloader.css'])
    .pipe(gulp.dest('./.build/'));

  // Render the template
  gulp.src('./app/templates/bootloader.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./.build'))
    // Then inline all of the css
    .pipe(juice())
    .pipe(gulp.dest('./.build'));
});

gulp.task('manifest', function(){
  gulp.src('./.build/**/*')
    .pipe(manifest({
      version: '0.0.1'
    }))
    .pipe(gulp.dest('./.build/sterno-manifest.json'));
});

gulp.task('build', ['pages', 'copyAssets', 'js', 'css', 'manifest', 'bootloader']);

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'mongod', 'watch']);
