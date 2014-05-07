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

if(!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

gulp.task('dev', ['ui', 'server', 'watch']);
gulp.task('ui', ['pages', 'assets', 'js', 'less', 'manifest']);
gulp.task('default', ['dev']);

gulp.task('server', function(){
  if(server){
    notifier.notify({title: 'reloading server'});
    return server.reload();
  }

  server = keepup('node index.js').on('crash', function(data){
    notifier.notify({title: 'server crashed', message: data.captured});
    console.error(data.captured);
  }).on('reload', function(){
    console.log('reloading server');
  });
});

gulp.task('watch', function(){
  gulp.watch(['./lib/{*,**/*}.js'], ['server']);

  gulp.watch(['ui/app/{*,**/*}.js', 'ui/app/views/tpl/{*,**/*}.jade'], ['js']);

  gulp.watch(['ui/pages/*.less', 'ui/{*,less/*,less/**/*}.less'], ['less']);

  gulp.watch(['ui/pages/*.jade'], ['pages']);

  gulp.watch(['ui/{img,fonts}/*'], ['assets']);
});

function browserifyError(err){
  var path = (err.annotated || err.message).replace(__dirname + '/', '').split('\n')[1],
    title = 'err: ' + path;
  notifier.notify({title: title || 'js error', message: err.annotated || err.message});
  console.error('js error', err);
}

gulp.task('js', function(){
  ['index.js', 'styleguide.js'].map(function(entrypoint){
    browserify({entries: ['./ui/app/' + entrypoint]})
      .transform(require('jadeify'))
      .bundle({debug: (process.env.NODE_ENV === 'development')})
      .on('error', browserifyError)
      .pipe(source(entrypoint))
      .pipe(gulp.dest('static/'));
  });
});

gulp.task('assets', function(){
  gulp.src(['ui/{img,fonts,less}/*'])
    .pipe(gulp.dest('static/'));
  gulp.src(['ui/node_modules/font-awesome/{img,fonts}/*'])
    .pipe(gulp.dest('static/'));
});

gulp.task('less', function () {
  var opts = {
    sourceMap: (process.env.NODE_ENV === 'development'),
    paths: [
        'ui/less',
        'ui/node_modules/font-awesome/less',
        'ui/node_modules/bootstrap/less'
      ]
    },
  less = function(){
    return require('gulp-less')(opts).on('error', function(err){
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
