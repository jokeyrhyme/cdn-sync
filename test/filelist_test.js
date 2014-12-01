/*eslint-disable no-sync*/
'use strict';

// Node.JS standard modules

var fs = require('fs');
var path = require('path');

// 3rd-party modules

var chai = require('chai');
var assert = require('chai').assert;
var Q = require('q');

// custom modules

// promise-bound anti-callbacks

// this module

chai.use(require('sinon-chai'));

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

suite('FileList object: "fromPath" with sub-directories', function () {
  var FileList, files;

  suiteSetup(function () {
    FileList = require('../lib/filelist');
  });

  test('factory method "fromPath" completes eventually', function (done) {
    FileList.fromPath(path.join(__dirname, '..', 'lib')).then(function (f) {
      // onSuccess
      files = f;
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    });
  });

  test('factory method "fromPath" skips directories', function () {
    var hasDirectories = files.some(function (file) {
      return file.path[file.path.length - 1] === '/';
    });
    assert(!hasDirectories, 'no directories included in results');
  });

  test('"ready" signals eventually', function (done) {
    files.ready().then(function () {
      // onSuccess
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    }).done();
  });

});

suite('fileList.applyStrategy "gzip"', function () {
  var FileList, files, originalLength;

  suiteSetup(function (done) {
    FileList = require('../lib/filelist');
    FileList.fromPath(path.join(__dirname, '..', 'doc')).then(function (f) {
      // onSuccess
      files = f;
      originalLength = files.length;
      done();
    }, done);
  });

  test('strategy "gzip" completes eventually', function (done) {
    files.applyStrategy(['gzip']).then(function (f) {
      // onSuccess
      files = f;
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    });
  });

  test('same number of files', function () {
    assert.lengthOf(files, originalLength, files.length + ' file(s)');
  });

});

suite('fileList.applyStrategy "clone"', function () {
  var FileList, files, originalLength;

  suiteSetup(function (done) {
    FileList = require('../lib/filelist');
    FileList.fromPath(path.join(__dirname, '..', 'doc')).then(function (f) {
      // onSuccess
      files = f;
      originalLength = files.length;
      done();
    }, done);
  });

  test('strategy "gzip" completes eventually', function (done) {
    files.applyStrategy(['clone']).then(function (f) {
      // onSuccess
      files = f;
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    });
  });

  test('same number of files', function () {
    assert.lengthOf(files, originalLength, files.length + ' file(s)');
  });

});

suite('fileList.applyStrategy "gzip-suffix"', function () {
  var FileList, files, originalLength;

  suiteSetup(function (done) {
    FileList = require('../lib/filelist');
    FileList.fromPath(path.join(__dirname, '..', 'doc')).then(function (f) {
      // onSuccess
      files = f;
      originalLength = files.length;
      done();
    }, done);
  });

  test('strategy "gzip-suffix" completes eventually', function (done) {
    files.applyStrategy(['gzip-suffix']).then(function (f) {
      // onSuccess
      files = f;
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    });
  });

  test('same number of files', function () {
    assert.lengthOf(files, originalLength, files.length + ' file(s)');
  });

  test('all files end in .gz', function () {
    assert.isFalse(files.some(function (file) {
      return file.path.indexOf('.gz') === -1;
    }), 'no non-.gz files found');
  });

});

suite('fileList.applyStrategy ["clone", "gzip-suffix"]', function () {
  var FileList, files, originalFiles, originalLength, filename;
  filename = 'deployment.md';

  suiteSetup(function (done) {
    FileList = require('../lib/filelist');
    FileList.fromPath(path.join(__dirname, '..', 'doc')).then(function (f) {
      // onSuccess
      originalFiles = f;
      originalLength = f.length;
      done();
    }, done);
  });

  test('originalFiles contains ' + filename, function () {
    assert(originalFiles.indexOf(filename) !== -1, 'known file included');
  });

  test('strategy ["clone", "gzip-suffix"] completes', function (done) {
    originalFiles.applyStrategy(['clone', 'gzip-suffix']).then(function (f) {
      // onSuccess
      files = f;
      assert(true, 'calls success handler');
      done();
    }, function (err) {
      // onError
      assert.fail(true, false, 'does not call error handler');
      done(err);
    });
  });

  test('files.ready', function () {
    var promise;
    assert.isFunction(files.ready, 'files.ready is a function');
    promise = files.ready();
    assert.isTrue(Q.isPromise(promise), 'files.ready returns a promise');
  });

  test('files.constructor', function () {
    assert.isFunction(files.constructor, 'files.constructor is a function');
    assert.equal(files.constructor, FileList, 'constructor function');
  });

  test('files.indexOf', function () {
    assert.isFunction(files.indexOf, 'files.indexOf is a function');
    assert.equal(files.indexOf, FileList.prototype.indexOf, 'prototyped');
  });

  test('originalFiles still contains ' + filename, function () {
    assert(originalFiles.indexOf(filename) !== -1, 'known file included');
  });

  test('files contains ' + filename, function () {
    assert(files.some(function (f) {
      return f.path === filename;
    }), 'known file included');
    assert(files.indexOf(filename) !== -1, 'known file index found');
  });

  test('files contains ' + filename + '.gz', function () {
    assert(files.some(function (f) {
      return f.path === filename + '.gz';
    }), 'known file included');
    assert(files.indexOf(filename + '.gz') !== -1, 'known file index found');
  });

  test('doubles the number of files', function () {
    assert.equal(files.length, originalLength * 2, files.length + ' file(s)');
  });

  suite('compare files against originalFiles', function () {
    var ActionList, actions;

    suiteSetup(function () {
      ActionList = require('../lib/actionlist');
      actions = new ActionList();
      actions.compareFileLists(files, originalFiles);
    });

    test('only actions should be to upload the .gz files', function () {
      assert.lengthOf(actions, files.length / 2, 'actions for half the files');
    });

    test('only upload actions', function () {
      var hasDeletes, hasHeaders;

      hasDeletes = actions.some(function (action) {
        return action.doDelete;
      });
      assert.isFalse(hasDeletes, 'no delete actions');

      hasHeaders = actions.some(function (action) {
        return action.doHeaders;
      });
      assert.isFalse(hasHeaders, 'no headers actions');
    });

  });

});
