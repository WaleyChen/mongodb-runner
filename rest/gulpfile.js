
var gulp = require('gulp'),
  gutil = require('gulp-util'),
  app = require('./');

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
          gutil.log('\033[97mctrl + r\033[90m detected - reloading');
          app.reload();
          break;
      }
    });
  }

  gulp.watch(['./lib/{*,**/*}.js'], ['reload']);
});

gulp.task('dev', ['server', 'watch']);
