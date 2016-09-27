var gulp = require('gulp');
var mocha = require("gulp-mocha");

gulp.task("test", function() {
  return gulp.src([
      "./tests/utils.js",
      "./tests/users/users.test.js"
    ])
    .pipe(mocha());
});
