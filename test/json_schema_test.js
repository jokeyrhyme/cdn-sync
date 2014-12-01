/*jslint indent:2, maxlen:80, node:true, nomen:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

var chai, assert, sinon, request, ZSchema;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
request = require('request');
sinon = require('sinon');
ZSchema = require('z-schema');

// custom modules

// promise-bound anti-callbacks

// this module

var example;
example = {
  "targets": [
    {
      "type": "aws",
      "options": {
        "accessKeyId": "...",
        "secretAccessKey": "...",
        "region": "...",
        "sslEnabled": true,
        "Bucket": "..."
      },
      "strategy": ["clone"]
    }
  ]
};

suite('JSON schema for `.cdn-sync.json`', function () {
  var validator, schema, jsonSchemaURL;

  suiteSetup(function (done) {
    this.timeout(15e3);
    jsonSchemaURL = 'http://json-schema.org/draft-04/schema';
    validator = new ZSchema({
      strictMode: false // true
    });
    schema = require(path.join(__dirname, '..', 'doc', 'cdn-sync.schema.json'));
    request(jsonSchemaURL, function (err, res, body) {
      validator.setRemoteReference(jsonSchemaURL, JSON.parse(body));
      done();
    });
  });

  test('schema passes validation', function () {
    var err, valid;
    valid = validator.validateSchema(schema);
    err = validator.getLastErrors();
    assert(!err);
    assert.isTrue(valid);
  });

  test('schema compiles', function () {
    var err, valid;
    valid = validator.compileSchema(schema);
    err = validator.getLastErrors();
    assert(!err);
    assert.isTrue(valid);
  });

  test('example validates against compiled schema', function (done) {
    validator.validate(example, schema, function (err, valid) {
      assert(!err);
      assert.isTrue(valid);
      done();
    });
  });

  test('example without region does not validate', function (done) {
    var broken;
    broken = JSON.parse(JSON.stringify(example));
    delete broken.targets[0].options.region;
    validator.validate(broken, schema, function (err, valid) {
      assert(err);
      assert.isFalse(valid);
      done();
    });
  });
});

suite('Config.validate', function () {

  var Config;

  suiteSetup(function () {
    Config = require(path.join(__dirname, '..', 'lib', 'config'));
  });

  test('Config.validate(example)', function (done) {
    Config.validate(example).then(function () {
      // onResolve
      assert(true, 'example passes validation');
      done();
    }, function (err) {
      // onReject
      assert(false, err);
      done();
    });
  });

  test('Config.validate(broken)', function (done) {
    var broken;
    broken = JSON.parse(JSON.stringify(example));
    delete broken.targets[0].options.region;
    Config.validate(broken).then(function () {
      // onResolve
      assert(false, 'broken passed validation');
      done();
    }, function () {
      // onReject
      assert(true, 'broken failed validation');
      done();
    });
  });

});
