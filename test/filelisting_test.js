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

suite('FileListing module', function () {

  test('requires without issue', function () {
    var FileListing = require('../lib/filelisting');
    assert(FileListing instanceof Function, 'got FileListing constructor');
  });

});

suite('FileListing object: constructed with no arguments', function () {
  var FileListing, files;

  suiteSetup(function () {
    FileListing = require('../lib/filelisting');
  });

  test('inherits from Array', function () {
    files = new FileListing();
    assert(files instanceof Array, 'new object is an instance of Array');
  });

});

suite('FileListing object: factory method "fromPath"', function () {
  var FileListing, files;

  suiteSetup(function () {
    FileListing = require('../lib/filelisting');
  });

  test('factory method "fromPath" finds files', function (done) {
    this.timeout = 10 * 1000;
    FileListing.fromPath(__dirname).then(function (files) { // onSuccess
      assert(true, 'fromPath promise resolved');
      assert.equal(files.length, fs.readdirSync(__dirname).length,
        'found test files');
      done();
    }, function (err) { // onError
      assert(false, 'fromPath promise rejected');
      done();
    });
  });

  test('"ready" signals when all files are ready', function (done) {
    FileListing.fromPath(__dirname).then(function (files) { // onSuccess
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
