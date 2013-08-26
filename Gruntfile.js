/*jslint es5:true, indent:2, maxlen:80, node:true*/
'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    jslint: {
      all: {
        src: [
          '**/*.js',
          '**/*.json',
          '!test/**/*',
          '!node_modules/**/*'
        ],
        exclude: [],
        directives: {
          todo: true // TODO: eventually eliminate this exemption
        },
        options: {
          errorsOnly: true,
          failOnError: true
        }
      }
    },

    mochacli: {
      options: {
        require: ['chai'],
        ui: 'tdd'
      },
      all: ['test/*.js']
    },

    mochacov: {
      options: {
        reporter: 'html-cov',
        require: ['chai'],
        ui: 'tdd',
        output: 'tmp/coverage.html'
      },
      all: ['test/*.js']
    },

    watch: {
      scripts: {
        files: [
          '<%= jslint.all.src %>',
          'test/**/*'
        ],
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
  grunt.loadNpmTasks('grunt-mocha-cov');

  if (process.env.CI && process.env.TRAVIS) {
    grunt.registerTask('test', ['jslint', 'mochacli']);
  } else {
    grunt.registerTask('test', ['jslint', 'mochacli', 'mochacov']);
  }

  // Default task.
  grunt.registerTask('default', ['test']);

};
