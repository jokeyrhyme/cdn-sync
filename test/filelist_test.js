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

  suiteSetup(function () {
    FileList = require('../lib/filelist');
  });

  test('factory method "fromPath" finds files', function (done) {
    this.timeout = 10 * 1000;
    FileList.fromPath(__dirname).then(function (files) { // onSuccess
      assert(true, 'fromPath promise resolved');
      assert.lengthOf(files, fs.readdirSync(__dirname).length, 'found files');
      done();
    }, function (err) { // onError
      assert(false, 'fromPath promise rejected');
      done();
    });
  });

  test('"ready" signals when all files are ready', function (done) {
    FileList.fromPath(__dirname).then(function (files) { // onSuccess
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
    }, function (err) { // onError
      assert(false, 'fromPath promise rejected');
      done();
    });
  });

});
