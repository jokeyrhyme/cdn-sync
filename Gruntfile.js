/*jslint es5:true, indent:2, maxlen:80, node:true*/
'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    jslint: {
      files: [
        'Gruntfile.js',
        'index.js',
        'lib/**/*.js',
        'test/**/*.js'
      ],
      exclude: [],
      directives: {
        todo: true // TODO: eventually eliminate this exemption
      }
    },

    mochacli: {
      options: {
        require: ['chai'],
        ui: 'tdd'
      },
      all: ['test/*.js']
    },

    watch: {
      scripts: {
        files: '<%= jslint.files %>',
        tasks: ['test'],
        options: {
          interrupt: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha-cli');

  grunt.registerTask('test', ['jslint', 'mochacli']);

  // Default task.
  grunt.registerTask('default', ['test']);

};
