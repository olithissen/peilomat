var sftp = require("gulp-sftp");
var gulp = require("gulp");
var gutil = require("gulp-util");
var minimist = require("minimist");
var args = minimist(process.argv.slice(3));

gulp.task("deploy", function() {
  gulp
    .src(["app/index.html", "app/**/*.css", "app/**/*.js"])
    .pipe(
      sftp({
        host: args.host,
        user: args.user,
        pass: args.password,
        port: 33
      })
    )
    .pipe(conn.dest(remotePath));
});