'use strict'

// Node.JS standard modules

var fs = require('fs')

// 3rd-party modules

var assert = require('chai').assert

// custom modules

// promise-bound anti-callbacks

// this module

suite('bufferUtils module', function () {
  test('requires without issue', function () {
    var bufferUtils = require('../lib/bufferutils')
    assert.isObject(bufferUtils, 'got bufferUtils object')
  })
})

suite('bufferUtils.fromStream', function () {
  var bufferUtils

  suiteSetup(function () {
    bufferUtils = require('../lib/bufferutils')
  })

  test('"fromStream" with this file', function (done) {
    var rs = fs.createReadStream(__filename)
    bufferUtils.fromStream(rs).then(function (buffer) {
      // onSuccess
      var string
      assert(true, 'calls success handler')
      assert.instanceOf(buffer, Buffer, 'Buffer object is returned')
      string = buffer.toString()
      assert.isString(string, 'buffer.toString() returns a String')
      assert.notEqual(string.indexOf('/*jslint'), -1, 'found JSLint comment')
      done()
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler')
      done(err)
    }).done()
  })
})
