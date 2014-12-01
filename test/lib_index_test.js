'use strict';

// 3rd-party modules

var chai = require('chai');
var assert = require('chai').assert;
chai.use(require('sinon-chai'));

// custom modules

// promise-bound anti-callbacks

// this module

suite('main module', function () {

  test('requires without issue', function () {
    var cdnSync = require('../lib');
    assert.isObject(cdnSync, 'got Object');
  });

});

suite('main object', function () {
  var cdnSync = require('../lib');

  test('exposes Action constructor', function () {
    var Action = require('../lib/action');
    assert.equal(cdnSync.Action, Action, 'Action available');
  });

  test('exposes ActionList constructor', function () {
    var ActionList = require('../lib/actionlist');
    assert.equal(cdnSync.ActionList, ActionList, 'ActionList available');
  });

  test('exposes Config constructor', function () {
    var Config = require('../lib/config');
    assert.equal(cdnSync.Config, Config, 'Config available');
  });

  test('exposes File constructor', function () {
    var File = require('../lib/file');
    assert.equal(cdnSync.File, File, 'File available');
  });

  test('exposes FileList constructor', function () {
    var FileList = require('../lib/filelist');
    assert.equal(cdnSync.FileList, FileList, 'FileList available');
  });

  test('exposes GzippedFile constructor', function () {
    var GzippedFile = require('../lib/gzippedfile');
    assert.equal(cdnSync.GzippedFile, GzippedFile, 'GzippedFile available');
  });

  test('exposes Target constructor', function () {
    var Target = require('../lib/target');
    assert.equal(cdnSync.Target, Target, 'Target available');
  });

});
