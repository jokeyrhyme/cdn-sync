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

suite('ActionList module', function () {

  test('requires without issue', function () {
    var ActionList = require('../lib/actionlist');
    assert.isFunction(ActionList, 'got ActionList constructor');
  });

});

suite('ActionList object: constructed with no arguments', function () {
  var ActionList, actions;

  ActionList = require('../lib/actionlist');

  setup(function () {
    actions = new ActionList();
  });

  test('inherits from Array', function () {
    assert.isArray(actions, 'new object is an instance of Array');
  });

  test('starts out empty', function () {
    assert.lengthOf(actions, 0, 'length of new ActionList is zero');
  });

});

suite('ActionList object: comparison between empty FileLists', function () {
  var ActionList, FileList, local, remote;

  ActionList = require('../lib/actionlist');
  FileList = require('../lib/filelist');

  setup(function () {
    local = new FileList();
    remote = new FileList();
  });

  test('ActionList is empty', function () {
    var actions = new ActionList();
    actions.compareFileLists(local, remote);
    assert.lengthOf(actions, 0, 'length of new ActionList is zero');
  });

});

suite('ActionList object: comparison between same FileLists', function () {
  var ActionList, FileList, local;

  ActionList = require('../lib/actionlist');
  FileList = require('../lib/filelist');

  setup(function (done) {
    FileList.fromPath(__dirname).then(function (files) { // onSuccess
      local = files;
      done();
    }, done);
  });

  test('ActionList is empty', function () {
    var actions = new ActionList();
    actions.compareFileLists(local, local);
    assert.lengthOf(actions, 0, 'length of new ActionList is zero');
  });

});

suite('ActionList object: comparison between different FileLists', function () {
  var ActionList, FileList, local, remote, actions;

  ActionList = require('../lib/actionlist');
  FileList = require('../lib/filelist');

  setup(function (done) {
    FileList.fromPath(__dirname).then(function (files) { // onSuccess
      local = files;
      local.shift();
      local[0].mime = 'application/x-made-up';
      FileList.fromPath(__dirname).then(function (files) { // onSuccess
        remote = files;
        remote.pop();
        actions = new ActionList();
        actions.compareFileLists(local, remote);
        done();
      }, done);
    }, done);
  });

  test('ActionList is not empty', function () {
    assert.lengthOf(actions, 3, 'three Actions listed');
  });

  test('ActionList has one doUpload Action', function () {
    var uploads = actions.filter(function (action) {
      return action.doUpload === true;
    });
    assert.lengthOf(uploads, 1, 'one doUpload Action listed');
  });

  test('ActionList has one doHeaders Action', function () {
    var headers = actions.filter(function (action) {
      return action.doHeaders === true;
    });
    assert.lengthOf(headers, 1, 'one doHeaders Action listed');
  });

  test('ActionList has one doDelete Action', function () {
    var deletes = actions.filter(function (action) {
      return action.doDelete === true;
    });
    assert.lengthOf(deletes, 1, 'one doDelete Action listed');
  });

});
