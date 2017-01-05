'use strict'

// 3rd-party modules

var chai = require('chai')
var assert = require('chai').assert
chai.use(require('sinon-chai'))

// custom modules

// promise-bound anti-callbacks

// this module

suite('3rd-party "mime"', function () {
  var mime

  suiteSetup(function () {
    mime = require('mime')
  })

  test('has .define()', function () {
    assert.isFunction(mime.define)
  })

  test('has .lookup()', function () {
    assert.isFunction(mime.lookup)
  })
})

suite('"mime" and MIMEs', function () {
  var mime, fixture

  suiteSetup(function () {
    mime = require('mime')
    fixture = {
      'pen.cur': 'image/vnd.microsoft.icon',
      'styles.scss': 'text/x-scss',
      'styles.sass': 'text/x-sass'
    }
  })

  test('detects as expected', function () {
    Object.keys(fixture).forEach(function (filename) {
      var expected = fixture[filename]
      assert.equal(mime.lookup(filename), expected)
    })
  })
})
