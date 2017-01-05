/* eslint-disable no-unused-vars */
'use strict'

// Node.JS standard modules

// 3rd-party modules

var chai = require('chai')
var assert = require('chai').assert

// custom modules

// promise-bound anti-callbacks

// this module

chai.use(require('sinon-chai'))

suite('Action module', function () {
  test('requires without issue', function () {
    var Action = require('../lib/action')
    assert.isFunction(Action, 'got Action constructor')
  })
})

suite('Action constructor', function () {
  var Action = require('../lib/action')

  test('throws error for doUpload with no file', function () {
    assert.throws(function () {
      var action = new Action({ doUpload: true })
    }, Error)
  })

  test('throws error for doHeaders with no file', function () {
    assert.throws(function () {
      var action = new Action({ doHeaders: true })
    }, Error)
  })

  test('throws error for doDelete with no path', function () {
    assert.throws(function () {
      var action = new Action({ doDelete: true })
    }, Error)
  })
})
