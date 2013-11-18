/*jslint indent:2, maxlen:80, node:true*/
/*global suite:true, test:true, suiteSetup:true, suiteTeardown:true, setup:true,
 teardown:true*/ // Mocha
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';

// Node.JS standard modules

var fs, path;
fs = require('fs');
path = require('path');

// 3rd-party modules

var chai, assert, sinon;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

// custom modules

// promise-bound anti-callbacks

// this module

suite('3rd-party "mime"', function () {
  var File, mime;

  suiteSetup(function () {
    File = require(path.join('..', 'lib', 'file'));
    mime = require('mime');
  });

  test('has .define()', function () {
    assert.isFunction(mime.define);
  });

  test('has .lookup()', function () {
    assert.isFunction(mime.lookup);
  });
});

suite('"mime" and MIMEs', function () {
  var File, mime, fixture;

  suiteSetup(function () {
    File = require(path.join('..', 'lib', 'file'));
    mime = require('mime');
    fixture = {
      'pen.cur': 'image/vnd.microsoft.icon',
      'styles.scss': 'text/x-scss',
      'styles.sass': 'text/x-sass'
    };
  });

  test('detects as expected', function () {
    Object.keys(fixture).forEach(function (filename) {
      var expected = fixture[filename];
      assert.equal(mime.lookup(filename), expected);
    });
  });

});
