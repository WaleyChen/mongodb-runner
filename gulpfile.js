var gulp = require('gulp'),
  exec = require('child_process').exec,
  app = require('./lib/index'),
  browserify = require('browserify'),
  manifest = require('gulp-sterno-manifest'),
  Notification = require('node-notifier'),
  source = require('vinyl-source-stream'),
  pkg = require('./package.json');

var ui = {
  src: __dirname + '/ui/app',
  dest: __dirname + '/static'
};

gulp.task('dev', ['ui', 'server', 'watch']);
gulp.task('ui', ['pages', 'assets', 'js', 'less', 'manifest']);

gulp.task('server', function(){app.start();});
gulp.task('reload', function(){app.reload();});

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
          app.reload();
          break;
      }
    });
    console.log('[ctrl+c to quit]');
    console.log('[ctrl+r to reload]');
  }

  gulp.watch(['./lib/{*,**/*}.js'], ['reload']);

  gulp.watch([
    ui.src + '/{*,**/*}.js',
    ui.src + '/templates/{*,**/*}.jade'
  ], ['js']);

  gulp.watch([ui.src + '/{*,less/*,less/**/*}.less'], ['less']);
  gulp.watch([ui.src + '/pages/*.jade'], ['pages']);
  gulp.watch([ui.src + '/{img,fonts}/*'], ['assets']);
});

gulp.task('js', function(){
  var notifier = new Notification({});
  browserify({entries: [ui.src + '/index.js']})
    .transform(require('jadeify'))
    .bundle({debug: false})
    .on('error', function(err){
      var path = err.annotated.replace(__dirname + '/', '').split('\n')[1],
        title = 'err: ' + path;
      notifier.notify({title: title, message: err.annotated});
      console.error(title, err.annotated);
    })
    .pipe(source('index.js'))
    .pipe(gulp.dest(ui.dest));
});

gulp.task('assets', function(){
  gulp.src([ui.src + '/{img,fonts}/*'])
    .pipe(gulp.dest(ui.dest));

  gulp.src([ui.src + '/less/atom/{img,fonts}/*'])
    .pipe(gulp.dest(ui.dest));
});

gulp.task('less', function () {
  var lessPaths = [
      ui.src + '/less',
      ui.src + '/less/atom',
      ui.src + '/less/atom/variables'
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

  gulp.src(ui.src + '/less/index.less')
    .pipe(less())
    .pipe(gulp.dest(ui.dest));

  gulp.src(ui.src + '/less/pages/*.less')
    .pipe(less())
    .pipe(gulp.dest(ui.dest + '/css'));
});

gulp.task('pages', function(){
  var notifier = new Notification({}),
    jade = function(){
        return require('gulp-jade')({pretty: false}).on('error', function(err){
          notifier.notify({title: 'jade error', message: err.message});
        });
      };

  gulp.src(ui.src + '/templates/index.jade')
    .pipe(jade())
    .pipe(gulp.dest(ui.dest));

  gulp.src(ui.src + '/pages/*.jade')
    .pipe(jade())
    .pipe(gulp.dest(ui.dest));
});

gulp.task('manifest', function(){
  gulp.src(ui.dest + '/**/*')
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
