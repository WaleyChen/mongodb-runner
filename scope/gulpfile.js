var gulp = require('gulp'),
  gutil = require('gulp-util'),
  browserify = require('browserify'),
  manifest = require('gulp-sterno-manifest'),
  // livereload = require('gulp-livereload'),
  Notification = require('node-notifier'),
  source = require('vinyl-source-stream');

// 'form of: a webapp!'
gulp.task('build', ['pages', 'assets', 'js', 'less', 'manifest']);

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'watch', 'ready']);

gulp.task('ready', function(){
    gutil.log('mongoscope ready to use!', 'http://localhost:3000/');
  });

gulp.task('js', function(){
  var notifier = new Notification({});
  browserify({entries: ['./app/index.js']})
    .transform(require('jadeify'))
    .bundle({debug: false})
    .on('error', function(err){
      var path = err.annotated.replace(__dirname + '/', '').split('\n')[1],
        title = 'err: ' + path;
      notifier.notify({title: title, message: err.annotated});
      console.error(title, err.annotated);
    })
    .pipe(source('index.js'))
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('assets', function(){
  gulp.src(['./app/{img,fonts}/*'])
    .pipe(gulp.dest('../rest/ui'));
  gulp.src(['./app/less/atom/{img,fonts}/*'])
    .pipe(gulp.dest('../rest/ui'));
});

gulp.task('less', function () {
  var lessPaths = [
      __dirname + '/app/less',
      __dirname + '/app/less/atom',
      __dirname + '/app/less/atom/variables'
    ],
    notifier = new Notification({}),
    less = function(){
      return require('gulp-less')({paths: lessPaths}).on('error', function(err){
        var filename = err.filename.replace(__dirname + '/', ''),
          title = 'err: ' + filename,
          message = err.line + ': ' + err.message.split(' in file ')[0].replace(/`/g, '"');

        notifier.notify({title: title, message: message});
        console.error(title, message);
      });
    };

  gulp.src('./app/less/index.less')
    .pipe(less())
    .pipe(gulp.dest('../rest/ui'));

  gulp.src('./app/less/pages/*.less')
    .pipe(less())
    .pipe(gulp.dest('../rest/ui/css'));
});

gulp.task('pages', function(){
  var notifier = new Notification({}),
    jade = function(){
        return require('gulp-jade')({pretty: false}).on('error', function(err){
          notifier.notify({title: 'jade error', message: err.message});
        });
      };

  gulp.src('./app/templates/index.jade')
    .pipe(jade())
    .pipe(gulp.dest('../rest/ui'));

  gulp.src('./app/pages/*.jade')
    .pipe(jade())
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
  gulp.watch(['./app/{*,**/*}.js', './app/templates/{*,**/*}.jade'], ['js']);
  gulp.watch(['./app/{*,less/*,less/**/*}.less'], ['less']);
  gulp.watch(['./app/pages/*.jade'], ['pages']);
  gulp.watch(['./app/{img,fonts}/*'], ['assets']);
});
