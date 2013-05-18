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
    var cdnSync = require('../lib/file');
    assert(cdnSync instanceof Object, 'got Object');
  });

  test('exposes File constructor', function () {
    var cdnSync = require('../lib/cdn-sync'),
      File = require('../lib/file');

    assert.equal(cdnSync.File, File, 'File available');
  });

  test('exposes FileList constructor', function () {
    var cdnSync = require('../lib/cdn-sync'),
      FileList = require('../lib/filelist');

    assert.equal(cdnSync.FileList, FileList, 'FileList available');
  });
});
