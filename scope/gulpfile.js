var gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserify = require('gulp-browserify'),
  jade = require('gulp-jade'),
  concat = require('gulp-concat'),
  manifest = require('gulp-sterno-manifest'),
  es = require('event-stream');

// "form of: a webapp!"
gulp.task('build', ['pages', 'assets', 'js', 'css', 'manifest', 'bootloader']);

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'watch', 'ready']);

gulp.task('ready', function(){
    gutil.log('mongoscope ready to use!', 'http://localhost:3000/');
});

gulp.task('js', function(){
  // function collect(glob, fn){
  //   var paths = [];

  //   gulp.src(glob)
  //     .pipe(es.through(function(file){
  //         paths.push();
  //       }, function(){
  //         this.emit('end');
  //       }));
  // }

  // collect('./app/templates/*.jade', function(paths){
  //   gulp.src('./app/index.js')
  //     .pipe(browserify({
  //       debug : false, transform: ['jadeify'], require: paths
  //     }))
  //     .pipe(gulp.dest('../rest/ui'));
  // });

  gulp.src('./app/index.js')
    .pipe(browserify({debug : false, transform: ['jadeify']}))
    .pipe(gulp.dest('../rest/ui'));
});

// Jam all the various MMS stylesheets and our overrides into one css file
gulp.task('css', function(){
  gulp.src('./app/css/*.css')
    .pipe(concat('index.css'))
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('assets', function(){
  gulp.src(['./app/{img,fonts}/*'])
    .pipe(gulp.dest('../rest/ui'));
});

// Compile the html container template
gulp.task('pages', function(){
  gulp.src('./app/templates/index.jade')
    .pipe(jade({pretty: false}))
    .pipe(gulp.dest('../rest/ui'));
});

// Treat `./static` as our web root and serve things up locally on port 3000
gulp.task('serve', function(){
  var port = 3000;
  require('http').createServer(
    require('ecstatic')({ root: __dirname + '/../rest/ui' })
  ).listen(port);
});

// App within the app that takes care of bootstrapping from a single HTML file.
gulp.task('bootloader', function(){
  gulp.src('./app/bootloader.js')
    .pipe(browserify({debug : false}))
    .pipe(gulp.dest('../rest/ui'));

  gulp.src(['./app/css/bootloader.css'])
    .pipe(gulp.dest('../rest/ui'));

  gulp.src('./app/templates/bootloader.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('../rest/ui'));
});


// Generate the sterno manifest for bootloader
gulp.task('manifest', function(){
  gulp.src('../rest/ui**/*')
    .pipe(manifest({version: '0.0.1'}))
    .pipe(gulp.dest('../rest/ui/sterno-manifest.json'));
});

// Set up watchers to reprocess CSS and JS when files are changed
gulp.task('watch', function (){
  gulp.watch(['./app/{*,**/*}.{js,jade}',], ['js']);
  gulp.watch(['./app/css/*.css'], ['css']);
  gulp.watch(['./app/templates/index.jade'], ['pages']);
  gulp.watch(['./app/{img,fonts}/*'], ['assets']);
});
