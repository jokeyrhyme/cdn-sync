/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*global suite:true, test:true, suiteSetup:true, suiteTeardown:true, setup:true,
 teardown:true*/ // Mocha
/*jslint nomen:true*/ // Underscore.JS and __dirname
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

suite('main module', function () {

  test('requires without issue', function () {
    var cdnSync = require('../lib/cdn-sync');
    assert.isObject(cdnSync, 'got Object');
  });

});

suite('main object', function () {
  var cdnSync = require('../lib/cdn-sync');

  test('exposes Action constructor', function () {
    var Action = require('../lib/action');
    assert.equal(cdnSync.Action, Action, 'Action available');
  });

  test('exposes ActionList constructor', function () {
    var ActionList = require('../lib/actionlist');
    assert.equal(cdnSync.ActionList, ActionList, 'ActionList available');
  });

  test('exposes File constructor', function () {
    var File = require('../lib/file');
    assert.equal(cdnSync.File, File, 'File available');
  });

  test('exposes FileList constructor', function () {
    var FileList = require('../lib/filelist');
    assert.equal(cdnSync.FileList, FileList, 'FileList available');
  });

});
