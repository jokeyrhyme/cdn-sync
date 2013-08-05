/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var Q;
Q = require('q');

// custom modules

var Target = require(path.join(__dirname, 'target'));

// this module

var Config = function (obj) {
  if (!obj.targets || !obj.targets.length || !obj.targets.map) {
    throw new Error('.cdn-sync.json defines no target CDNs');
  }
  this.targets = obj.targets.map(function (t) {
    return new Target(t);
  });
  return this;
};

Config.FILENAME = '.cdn-sync.json';

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
Config.fromFile = function (path) {
  var cfg;
  try {
    cfg = require(path);
  } catch (err) {
    throw new Error('.cdn-sync.json in unexpected format');
  }
  return new Config(cfg);
};

// exports

module.exports = Config;
