/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var Q, ZSchema;
Q = require('q');
ZSchema = require('z-schema');

// custom modules

var Target, schema;
Target = require(path.join(__dirname, 'target'));
schema = require(path.join(__dirname, '..', 'doc', 'cdn-sync.schema.json'));

// this module

var Config = function (obj) {
  if (!obj || !obj.targets || !Array.isArray(obj.targets)) {
    throw new TypeError('#/targets: expecting an Array');
  }
  this.original = JSON.parse(JSON.stringify(obj));

  this.targets = obj.targets.map(function (t) {
    return new Target(t);
  });
  return this;
};

Config.FILENAME = '.cdn-sync.json';

Config.prototype.validate = function () {
  var validator, dfrd, me;
  dfrd = Q.defer();
  me = this;

  validator = new ZSchema();
  validator.validate(this.original, schema, function (report) {
    var error;
    if (report.valid) {
      dfrd.resolve(me);
    } else {
      error = report.errors[0];
      dfrd.reject(new TypeError(error.path + ': ' + error.message));
    }
  });
  return dfrd.promise;
};

Config.prototype.testTargets = function () {
  var tests = this.targets.map(function (t) {
    return t.test();
  });
  return Q.all(tests);
};

/**
 * factory to generate Config object from a file (assumed to exist)
 * @param path
 */
Config.fromFile = function (file) {
  var obj, config;
  try {
    obj = require(file);
  } catch (err) {
    throw new Error('.cdn-sync.json in unexpected format');
  }
  config = new Config(obj);
  config.cwd = path.dirname(file);
  return config;
};

// exports

module.exports = Config;
