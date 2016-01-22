/**
 * Created by michbil on 22.01.16.
 */
/**
 * Created by michbil on 23.11.15.
 */

var gulp = require('gulp');
//var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');

/*
function restart_nodemon () {
    if (nodemon_instance) {
        console.log("Restarting nodemon");
        nodemon_instance.emit('restart');
    } else {
        console.log("Nodemon isntance not ready yet")
    }

}

gulp.task('babel-server', function() {
    restart_nodemon();
});

 var nodemon_instance;

 gulp.task('nodemon', function() {

 if (!nodemon_instance) {
 nodemon_instance = nodemon({
 script: 'server.js',
 watch: 'src/__manual_watch__',
 ext: '__manual_watch__',
 verbose: false
 }).on('restart', function() {
 console.log('~~~ restart server ~~~');
 });
 } else {
 nodemon_instance.emit('restart');
 }

 });


*/
gulp.task('test', function() {
    return gulp.src('test/**/*.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({
            reporter: 'dot',
            timeout: 30000
        }))
        .once('error', function (err) {

            console.log('Tests failed for reason:',err.message);
            console.log(err.stack);
            process.exit(1);
        })
        .once('end', function () {
            process.exit();
        });
});


//gulp.task('default', ['babel-server']);

gulp.task('watch', ['default', 'nodemon'], function() {
    gulp.watch(['./src/**/*.js'], ['babel-server']);
});