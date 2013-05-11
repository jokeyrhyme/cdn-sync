/*jslint es5:true, indent:2, maxlen:80, node:true*/
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

suite('File module', function () {

  test('requires without issue', function () {
    var File = require('../lib/file');
    assert(File instanceof Function, 'got File constructor');
  });

});

suite('File objects', function () {
  var File, md5Spy, mimeSpy;

  suiteSetup(function () {
    File = require('../lib/file');
  });

  setup(function () {
    // TODO: these spies aren't working
    md5Spy = sinon.spy(File.prototype, 'calculateMD5');
    mimeSpy = sinon.spy(File.prototype, 'detectMIME');
  });

  test('skip Magic and MD5 if constructed without local path', function () {
    var file, spy;

    file = new File();

    assert(!file.localPath, 'no localPath set');
    assert.equal(md5Spy.callCount, 0, 'calculateMD5 method never called');
  });

//  test('skip Magic if constructed with MIME type', function () {
//    var file = new File({
//      localPath: '../package.json',
//      mime: 'application/json'
//    });
//    assert.equal(file.localPath, '../package.json', 'localPath set');
//    assert.equal(mimeSpy.callCount, 0, 'detectMIME method never called');
//  });

  test('skip Magic if constructed with MIME type', function () {
    var file = new File({ mime: 'image/jpeg' });

  });

  teardown(function () {
    File.prototype.calculateMD5.restore();
    File.prototype.detectMIME.restore();
  });

});
