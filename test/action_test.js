/*jslint indent:2, maxlen:80, node:true*/
/*global suite:true, test:true, suiteSetup:true, suiteTeardown:true, setup:true,
 teardown:true*/ // Mocha
'use strict';

// Node.JS standard modules

// 3rd-party modules

var chai, assert, sinon;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

// custom modules

// promise-bound anti-callbacks

// this module

suite('Action module', function () {

  test('requires without issue', function () {
    var Action = require('../lib/action');
    assert.isFunction(Action, 'got Action constructor');
  });

});

suite('Action constructor', function () {
  var Action = require('../lib/action');

  test('throws error for doUpload with no file', function () {
    assert.throws(function () {
      var action = new Action({ doUpload: true });
    }, Error);
  });

  test('throws error for doHeaders with no file', function () {
    assert.throws(function () {
      var action = new Action({ doHeaders: true });
    }, Error);
  });

  test('throws error for doDelete with no path', function () {
    assert.throws(function () {
      var action = new Action({ doDelete: true });
    }, Error);
  });

});
