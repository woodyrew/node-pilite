'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: ['test/node_unit.js']
        }
      , watch: {
            lib: {
                files  : ['lib/**/*.js']
              , tasks: ['nodeunit']
            }
          , test: {
                files  : ['test/**/*.js']
              , tasks: ['nodeunit']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['nodeunit']);

};
