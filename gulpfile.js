/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

gulp.task('build', [
  'styles',
  'scripts'
]);

gulp.task('html', function() {
  gulp.src('index.html')
    .pipe(gulp.dest('build'));
});

gulp.task('images', function() {
  gulp.src('images/**/*')
    .pipe(gulp.dest('build/images'))
});

gulp.task('scripts', function() {
  //pump([
    gulp.src('scripts/**/*.js')
      .pipe(babel({presets: ['es2015']}))
      .pipe(concat('letsplay.js'))
      .pipe(uglify())
      .pipe(gulp.dest('build/js'));
});

gulp.task('styles', function() {
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('build/css'));
});

gulp.task('misc', function() {
  gulp.src('sw.js')
    .pipe(gulp.dest('build'));

  gulp.src('manifest.json')
    .pipe(gulp.dest('build'));
});

gulp.task('lint', function(){
  return gulp.src(['scripts/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
