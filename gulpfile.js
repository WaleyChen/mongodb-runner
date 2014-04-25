var gulp = require('gulp'),
  exec = require('child_process').exec,
  browserify = require('browserify'),
  manifest = require('gulp-sterno-manifest'),
  Notification = require('node-notifier'),
  source = require('vinyl-source-stream'),
  keepup = require('keepup'),
  pkg = require('./package.json'),
  server,
  notifier = new Notification({});

gulp.task('dev', ['ui', 'server', 'watch']);
gulp.task('ui', ['pages', 'assets', 'js', 'less', 'manifest']);
gulp.task('default', ['dev']);

gulp.task('server', function(){
  server = keepup('node index.js').on('crash', function(data){
    notifier.notify({title: 'server crashed', message: data.captured});
    console.error(data.captured);
  }).on('reload', function(){
    console.log('reloading server');
  });
});

gulp.task('server reload', function(){
  notifier.notify({title: 'reloading server'});
  server.reload();
});

gulp.task('watch', function(){
  gulp.watch(['./lib/{*,**/*}.js'], ['server reload']);

  gulp.watch(['ui/app/{*,**/*}.js', 'ui/app/views/tpl/{*,**/*}.jade'], ['js']);

  gulp.watch(['ui/pages/*.less', 'ui/{*,less/*,less/**/*}.less'], ['less']);

  gulp.watch(['ui/pages/*.jade'], ['pages']);

  gulp.watch(['ui/{img,fonts}/*'], ['assets']);
});

gulp.task('js', function(){
  browserify({entries: ['./ui/app/index.js']})
    .transform(require('jadeify'))
    .bundle({debug: false})
    .on('error', function(err){
      var path = (err.annotated || err.message).replace(__dirname + '/', '').split('\n')[1],
        title = 'err: ' + path;
      notifier.notify({title: title || 'js error', message: err.annotated || err.message});
      console.error('js error', err);
    })
    .pipe(source('index.js'))
    .pipe(gulp.dest('static/'));
});

gulp.task('assets', function(){
  gulp.src(['ui/{img,fonts}/*'])
    .pipe(gulp.dest('static/'));

  gulp.src(['ui/less/atom/{img,fonts}/*'])
    .pipe(gulp.dest('static/'));
  gulp.src(['ui/less/fontawesome/{img,fonts}/*'])
    .pipe(gulp.dest('static/'));
});

gulp.task('less', function () {
  var lessPaths = [
    'ui/less',
    'ui/less/atom',
    'ui/less/atom/variables',
    'ui/less/fontawesome'
  ],
  less = function(){
    return require('gulp-less')({paths: lessPaths}).on('error', function(err){
      var filename = err.fileName.replace(__dirname + '/', ''),
        title = 'err: ' + filename,
        message = err.lineNumber + ': ' + err.message.split(' in file ')[0].replace(/`/g, '"');

      notifier.notify({title: title, message: message});
      console.error(title, message);
    });
  };

  gulp.src('ui/pages/*.less')
    .pipe(less())
    .pipe(gulp.dest('static/css'));
});

gulp.task('pages', function(){
  var jade = function(){
        return require('gulp-jade')({pretty: false}).on('error', function(err){
          notifier.notify({title: 'jade error', message: err.message});
          console.error('jade error', err);
        });
      };

  gulp.src('ui/pages/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('static/'));
});

gulp.task('manifest', function(){
  gulp.src('static/' + '/**/*')
    .pipe(manifest({version: pkg.version}))
    .pipe(gulp.dest(__dirname + '/static/sterno-manifest.json'));
});

gulp.task('gh-pages', function(){
  var msg, cmd,
    src = __dirname,
    dest = __dirname + '/static',
    remote = pkg.repository.url.replace('git://github.com/', 'git@github.com:');

  exec('git log --oneline HEAD | head -n 1', {cwd: src}, function(err, stdout){
    msg = stdout.toString();
    cmd = [
      'git init',
      'rm -rf .DS_Store **/.DS_Store',
      'git add .',
      'git commit -m "Deploy: ' + msg + '"',
      'git push --force ' + remote + ' master:gh-pages',
      'rm -rf .git'
    ].join('&&');

    exec(cmd, {cwd: dest}, function(){
      console.log('deployed');
    });
  });
});

gulp.task('deploy', ['ui', 'gh-pages']);
