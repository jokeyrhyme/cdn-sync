/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*global suite:true, test:true, suiteSetup:true, suiteTeardown:true, setup:true,
 teardown:true*/ // Mocha
/*jslint nomen:true*/ // Underscore.JS and __dirname
/*jslint stupid:true*/ // allow ...Sync methods to be used
'use strict';

// Node.JS standard modules

var fs = require('fs');

// 3rd-party modules

var chai, assert, sinon;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

// custom modules

// promise-bound anti-callbacks

// this module

suite('FileList module', function () {

  test('requires without issue', function () {
    var FileList = require('../lib/filelist');
    assert(FileList instanceof Function, 'got FileList constructor');
  });

});

suite('FileList object: constructed with no arguments', function () {
  var FileList, files;

  suiteSetup(function () {
    FileList = require('../lib/filelist');
  });

  test('inherits from Array', function () {
    files = new FileList();
    assert(files instanceof Array, 'new object is an instance of Array');
  });

});

suite('FileList object: factory method "fromPath"', function () {
  var FileList, files;

  suiteSetup(function (done) {
    FileList = require('../lib/filelist');
    FileList.fromPath(__dirname).then(function (f) { // onSuccess
      files = f;
      done();
    }, done);
  });

  test('factory method "fromPath" finds files', function () {
    assert.lengthOf(files, fs.readdirSync(__dirname).length, 'found files');
  });

  test('"indexOf" finds a file known to exist', function () {
    var index = files.indexOf('filelist_test.js');
    assert.isNumber(index, 'returns a number');
    assert(index >= 0, 'index is 0 or greater; file found');
  });

  test('"indexOf" does not find a non-existent file', function () {
    var index = files.indexOf('abc123.fake');
    assert.isNumber(index, 'returns a number');
    assert.equal(index, -1, 'index is -1; file not found');
  });

  test('"ready" signals when all files are ready', function (done) {
    files.ready().then(function () {
      files.forEach(function (file) {
        assert(file.size, 'file has size set');
        assert(file.mime, 'file has MIME set');
        assert(file.path, 'file has absolute path set');
        assert(file.localPath, 'file has relative path set');
        assert(file.md5, 'file has MD5 set');
      });
      done();
    }).done();
  });

});
