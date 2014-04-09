'use strict';

var gulp = require('gulp'),
  gutil = require('gulp-util'),
  exec = require('child_process').exec,
  app = require('./');

var pkg = require('./package.json');

gulp.task('server', function(){app.start();});
gulp.task('reload', function(){app.reload();});

gulp.task('deploy', function(){
  var msg, cmd,
    src = __dirname,
    dest = __dirname + '/static',
    remote = pkg.repository.url.replace('git://github.com/', 'git@github.com:');

  exec('gulp build', {cwd: __dirname + '/ui'}, function(){

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
          gutil.log('[ctrl + r detected - reloading]');
          app.reload();
          break;
      }
    });
  }

  gulp.watch(['./lib/{*,**/*}.js'], ['reload']);
});

gulp.task('dev', ['server', 'watch']);
