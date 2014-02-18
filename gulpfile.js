var gulp = require('gulp'),
  browserify = require('gulp-browserify'),
  jade = require('gulp-jade'),
  concat = require('gulp-concat'),
  todo = require('gulp-todo'),
  manifest = require('gulp-manifest'),
  mongodbProxy = require('mongodb-rest-proxy');

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
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./.build'));
});

gulp.task('copyAssets', function(){
  gulp.src(['./app/{css,img,fonts}/*'])
    .pipe(gulp.dest('./.build/'));
});

// Set up watchers to reprocess CSS and JS when files are changed
gulp.task('watch', function (){
  gulp.watch(['./app/{*,**/*}.{js,jade}',], ['js']);
  gulp.watch(['./app/css/*.css'], ['css']);
  gulp.watch(['./app/templates/index.jade'], ['appshell']);
});

// Compile the html container template
gulp.task('appshell', function(){
  gulp.src('./app/templates/index.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./.build/'));
});

// Treat `./static` as our web root and serve things up locally on port 3000
gulp.task('serve', function(){
  require('http').createServer(
    require('ecstatic')({ root: __dirname + '/.build' })
  ).listen(3000);

  console.log('scope running at', 'http://localhost:3000/');
});

gulp.task('mongodbproxy', function(){
  mongodbProxy.listen(mongodbProxy.port, function(){
    console.log('mongo api proxy running on', mongodbProxy.port);
  });
});

gulp.task('manifest', function(){
  gulp.src(['!./.build/*.manifest', './.build/{*,**/*}'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      timestamp: true
     }))
    .pipe(gulp.dest('./.build/app.manifest'));
});

gulp.task('build', ['appshell', 'js', 'css', 'manifest']);

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'mongodbproxy', 'watch']);
