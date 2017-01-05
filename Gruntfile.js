'use strict'

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({

    mochacli: {
      options: {
        require: ['chai'],
        ui: 'tdd'
      },
      all: ['test/*.js']
    },

    mochacov: {
      html: {
        options: {
          reporter: 'html-cov',
          output: 'tmp/coverage.html'
        }
      },
      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },
      options: {
        require: ['chai'],
        ui: 'tdd'
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
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-mocha-cli')
  grunt.loadNpmTasks('grunt-mocha-cov')

  grunt.registerTask('travis', ['mochacli', 'mochacov:coveralls'])
  grunt.registerTask('test', ['mochacli', 'mochacov:html'])

  // Default task.
  grunt.registerTask('default', ['test'])
}
