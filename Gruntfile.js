module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: ['*.js', 'public/js/angular/*.js', 'public/js/*.js', 'public/js/angular/controller/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', 'jshint');

};