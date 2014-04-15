var gulp = require('gulp'),
  exec = require('child_process').exec,
  browserify = require('browserify'),
  manifest = require('gulp-sterno-manifest'),
  Notification = require('node-notifier'),
  source = require('vinyl-source-stream'),
  pkg = require('./package.json'),
  serverPid;

var nodemon = require('nodemon');

gulp.task('dev', ['ui', 'server', 'watch']);
gulp.task('ui', ['pages', 'assets', 'js', 'less', 'manifest']);
gulp.task('default', ['dev']);

gulp.task('server', function(){
  nodemon({
    script: 'index.js'
  });

  nodemon.on('start', function (pid) {
    serverPid = pid;
    console.log('App has started', arguments);
  }).on('quit', function () {
    console.log('App has quit');
  }).on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
});

// @todo: if there is an error, show notification
gulp.task('server reload', function(){
  process.kill(serverPid, 'SIGUSR2');
});

gulp.task('watch', function(){
  var tty = require('tty');

  function raw (mode) {
    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(mode);
    } else {
      tty.setRawMode(mode);
    }
  }

  if (tty.isatty(0)) {
    process.stdin.resume();
    raw(true);
    process.stdin.on('data', function (b) {
      var key = b.toString('utf8');
      switch (key) {
        case '\u0003': // Ctrl+C
          process.exit();
          break;

        case '\u0012': // Ctrl+R
          console.log('[ctrl + r detected - reloading]');
          process.kill(serverPid, 'SIGUSR2');
          break;
      }
    });
    console.log('[ctrl+c to quit]');
    console.log('[ctrl+r to reload]');
  }

  gulp.watch(['./lib/{*,**/*}.js'], ['server reload']);

  gulp.watch(['ui/app/{*,**/*}.js', 'ui/app/views/tpl/{*,**/*}.jade'], ['js']);

  gulp.watch(['ui/pages/*.less', 'ui/{*,less/*,less/**/*}.less'], ['less']);

  gulp.watch(['ui/pages/*.jade'], ['pages']);

  gulp.watch(['ui/{img,fonts}/*'], ['assets']);
});

gulp.task('js', function(){
  var notifier = new Notification({});
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
});

gulp.task('less', function () {
  var lessPaths = [
    'ui/less',
    'ui/less/atom',
    'ui/less/atom/variables'
  ],
  notifier = new Notification({}),
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
  var notifier = new Notification({}),
    jade = function(){
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
