/*jslint indent:2, maxlen:80, node:true, nomen:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

var chai, assert, sinon, ZSchema;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
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
  var validator, schema, compiledSchema;

  suiteSetup(function () {
    validator = new ZSchema({
      strict: false // true
    });
    schema = require(path.join(__dirname, '..', 'doc', 'cdn-sync.schema.json'));
  });

  test('schema passes validation', function (done) {
    validator.validateSchema(schema, function (err, valid) {
      if (valid) {
        assert.isTrue(valid);
      } else {
        console.log(err);
      }
      done();
    });
  });

  test('schema compiles', function (done) {
    validator.compileSchema(schema, function (err, compiled) {
      assert(true, 'asynchronous callback is executed');
      assert.isUndefined(err, 'no compilation errors');
      assert(compiled);
      compiledSchema = compiled;
      done();
    });
  });

  test('example validates against compiled schema', function () {
    var report;
    report = validator.validateWithCompiled(example, compiledSchema);
    assert.isTrue(report.valid, JSON.stringify(report.errors));
  });

  test('example without region does not validate', function () {
    var broken, report;
    broken = JSON.parse(JSON.stringify(example));
    delete broken.targets[0].options.region;
    report = validator.validateWithCompiled(broken, compiledSchema);
    assert.isFalse(report.valid, "not valid");
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
