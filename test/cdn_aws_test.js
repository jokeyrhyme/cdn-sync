/*jslint es5:true, indent:2, maxlen:80, node:true, nomen:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
'use strict';

// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var chai, assert, sinon;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

// custom modules

var ActionList, File, FileList;
ActionList = require(path.join(__dirname, '..', 'lib', 'actionlist'));
File = require(path.join(__dirname, '..', 'lib', 'file'));
FileList = require(path.join(__dirname, '..', 'lib', 'filelist'));

// promise-bound anti-callbacks

// this module

suite('AWS module', function () {

  test('requires without issue', function () {
    var CDN = require('../lib/cdn/aws');
    assert.isFunction(CDN, 'got CDN constructor');
  });

});

suite('AWS constructor', function () {
  var CDN = require('../lib/cdn/aws');

  test('inherits from CDN', function () {
    var cdn = new CDN();
    assert.instanceOf(cdn, CDN);
  });

});

suite('AWS object: some local, some remote', function () {
  var CDN, cdn, listStub, headStub, localFiles;

  CDN = require('../lib/cdn/aws');
  cdn = new CDN();

  suiteSetup(function () {
    listStub = sinon.stub(cdn.api, 'listObjects', function (params, callback) {
      callback(null, {
        IsTruncated: false,
        Contents: [
          {
            Key: 'on-both.js',
            ETag: 'abc123',
            Size: 123
          },
          {
            Key: 'remote-only.js',
            ETag: 'abc123',
            Size: 123
          },
          {
            Key: 'headers-wrong.js',
            ETag: 'abc123',
            Size: 123
          },
          {
            Key: 'size-wrong.js',
            ETag: 'abc123',
            Size: 1233
          },
          {
            Key: 'hash-wrong.js',
            ETag: 'abc123',
            Size: 123
          }
        ]
      });
    });

    headStub = sinon.stub(cdn.api, 'headObject', function (params, callback) {
      if (params.Key === 'local-only.js') {
        callback(new Error(), {
          Code: 404
        });
      } else {
        callback(null, {
          CacheControl: '',
          ContentEncoding: null,
          ContentLength: 123,
          ContentType: 'application/javascript',
          ETag: 'abc123',
          Expiration: '',
          Expires: new Date(),
          LastModified: new Date()
        });
      }
    });

    localFiles = new FileList();
    localFiles.push(new File({
      path: 'on-both.js',
      md5: 'abc123',
      size: 123,
      mime: 'application/javascript'
    }));
    localFiles.push(new File({
      path: 'local-only.js',
      md5: 'abc123',
      size: 123,
      mime: 'application/javascript'
    }));
    localFiles.push(new File({
      path: 'headers-wrong.js',
      md5: 'abc123',
      size: 123,
      mime: 'text/javascript'
    }));
    localFiles.push(new File({
      path: 'size-wrong.js',
      md5: 'abc123',
      size: 1234,
      mime: 'application/javascript'
    }));
    localFiles.push(new File({
      path: 'hash-wrong.js',
      md5: 'abc1234',
      size: 123,
      mime: 'application/javascript'
    }));
  });

  test('cdn.listFiles calls AWS.S3.listObjects', function (done) {
    cdn.listFiles().done(function (files) {
      assert(listStub.called);
      done();
    });
  });

  test('cdn.listFiles results in a FileList object', function (done) {
    cdn.listFiles().done(function (files) {
      assert.isArray(files);
      assert.lengthOf(files, 5);
      files.forEach(function (file) {
        assert.instanceOf(file, File);
      });
      done();
    });
  });

  test('cdn.listFiles results in complete File objects', function (done) {
    cdn.listFiles().done(function (files) {
      files.forEach(function (file) {
        assert.isString(file.path);
        assert(file.path);
        assert.isString(file.md5);
        assert(file.md5);
        assert.isNumber(file.size);
        assert(file.size);
        assert.isString(file.mime);
        assert(file.mime);
      });
      done();
    });
  });

  suite('ActionList created with cdn.listFiles', function () {
    var remoteFiles, actions;

    suiteSetup(function (done) {
      cdn.listFiles().done(function (files) {
        remoteFiles = files;
        done();
      });
    });

    test('actionList has 5 Actions', function () {
      actions = new ActionList();
      actions.compareFileLists(localFiles, remoteFiles);
      assert.lengthOf(actions, 5);
    });

    test('actionList has 3 upload Actions', function () {
      var uploads = actions.filter(function (action) {
        return action.doUpload;
      });
      assert.lengthOf(uploads, 3);
    });

    test('actionList has 1 delete Action', function () {
      var deletes = actions.filter(function (action) {
        return action.doDelete;
      });
      assert.lengthOf(deletes, 1);
    });

    test('actionList has 1 header Action', function () {
      var headers = actions.filter(function (action) {
        return action.doHeaders;
      });
      assert.lengthOf(headers, 1);
    });

  });

  suiteTeardown(function () {
    cdn.api.listObjects.restore();
    cdn.api.headObject.restore();
  });

});
