var gulp = require('gulp'),
  browserify = require('gulp-browserify'),
  jade = require('gulp-jade'),
  concat = require('gulp-concat'),
  todo = require('gulp-todo'),
  manifest = require('gulp-manifest'),
  mongoProxy = require('./mongodb-api-proxy');

gulp.task('js', function(){
  gulp.src('app.js')
    .pipe(browserify({
      debug : false,
      transform: ['jadeify']
    }))
    .pipe(gulp.dest('./static'));
});

// Jam all the various MMS stylesheets and our overrides into one css file
gulp.task('css', function(){
  gulp.src('./static/css/*.css')
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./static'));
});

// Set up watchers to reprocess CSS and JS when files are changed
gulp.task('watch', function (){
  gulp.watch(['./*.js', './{controllers,lib}/*.js', './templates/{*.jade,**/*.jade}'], ['js']);
  gulp.watch(['./static/css/*.css'], ['css']);
  gulp.watch(['./templates/index.jade'], ['appshell']);
});

// Compile the html container template
gulp.task('appshell', function(){
  gulp.src('./templates/index.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./static/'));
});

// Treat `./static` as our web root and serve things up locally on port 3000
gulp.task('serve', function(){
  require('http').createServer(
    require('ecstatic')({ root: __dirname + '/static' })
  ).listen(3000);

  console.log('App running at', 'http://localhost:3000/');
});

gulp.task('proxy', function(){
  mongoProxy.listen(mongoProxy.port, function(){
    console.log('mongo api proxy running on', mongoProxy.port);
  });
});

gulp.task('build', ['appshell', 'js', 'css', 'manifest']);

gulp.task('manifest', function(){
  gulp.src(['static/*', '!static/*.manifest', 'static/{fonts,img}/*'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      timestamp: true
     }))
    .pipe(gulp.dest('./static/app.manifest'));
});

// What we'll call from `npm start` to work on this project
gulp.task('dev', ['build', 'serve', 'proxy', 'watch']);
