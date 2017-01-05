'use strict'

// Node.JS standard modules

var path = require('path')

// 3rd-party modules

var glob = require('glob')
var Mocha = require('mocha')

// custom modules

// promise-bound anti-callbacks

// this module

var mocha
mocha = new Mocha({
  ui: 'tdd'
})

glob('**/*.js', {
  cwd: path.join(__dirname, 'test'),
  mark: true
}, function (err, files) {
  if (err) {
    throw err
  }
  files = files.filter(function (file) {
    return file[file.length - 1] !== '/'
  })
  files.forEach(function (file) {
    mocha.addFile(path.join(__dirname, 'test', file))
  })
  mocha.run()
})
