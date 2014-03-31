var gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserify = require('gulp-browserify'),
  jade = require('gulp-jade'),
  concat = require('gulp-concat'),
  manifest = require('gulp-sterno-manifest'),
  less = require('gulp-less'),
  es = require('event-stream');

// "form of: a webapp!"
gulp.task('build', ['pages', 'assets', 'js', 'less', 'manifest']);

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'watch', 'ready']);

gulp.task('ready', function(){
    gutil.log('mongoscope ready to use!', 'http://localhost:3000/');
});

gulp.task('js', function(){
  gulp.src('./app/index.js')
    .pipe(browserify({debug : false, transform: ['jadeify']}))
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('assets', function(){
  gulp.src(['./app/{img,fonts}/*'])
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('less', function () {
  gulp.src('./app/*.less')
    .pipe(less({
      paths: [__dirname + '/app/less', __dirname + '/app/less/atom', __dirname + '/app/less/atom/variables']
    }))
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('pages', function(){
  gulp.src('./app/templates/{index,styleguide}.jade')
    .pipe(jade({pretty: false}))
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('serve', function(){
  var port = 3000;
  require('http').createServer(
    require('ecstatic')({ root: __dirname + '/../rest/ui' })
  ).listen(port);
});

gulp.task('manifest', function(){
  gulp.src('../rest/ui**/*')
    .pipe(manifest({version: '0.0.1'}))
    .pipe(gulp.dest('../rest/ui/sterno-manifest.json'));
});

gulp.task('watch', function (){
  gulp.watch(['./app/{*,**/*}.{js,jade}',], ['js']);
  gulp.watch(['./app/{*,less/*,less/**/*}.less'], ['less']);
  gulp.watch(['./app/templates/{index,styleguide}.jade'], ['pages']);
  gulp.watch(['./app/{img,fonts}/*'], ['assets']);
});
