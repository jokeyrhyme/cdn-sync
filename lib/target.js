/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var _ = require('underscore');

// custom modules

// this module

var Target = function (obj) {
  var badStrategies, CDN;
  if (typeof obj.type !== 'string' || !obj.type) {
    throw new Error('target CDN with no "type" string');
  }
  if (Target.TYPES.indexOf(obj.type) === -1) {
    throw new Error('unsupported CDN type: "' + obj.type + '"');
  }
  this.type = obj.type;

  if (!Array.isArray(obj.strategy) || !obj.strategy) {
    throw new Error('target CDN with no "strategy" list');
  }
  badStrategies = _.difference(obj.strategy, Target.STRATEGIES);
  if (badStrategies.length) {
    throw new Error('unsupported strategy: ' + badStrategies);
  }
  this.strategy = obj.strategy;
  try {
    CDN = require(path.join(__dirname, 'cdn', this.type));
    this.cdn = new CDN(obj.options);
  } catch (err) {
    throw new Error('CDN adapter error: ' + err);
  }
  return this;
};

Target.TYPES = ['aws'];
Target.STRATEGIES = ['clone'];

Target.prototype.test = function () {
  return this.cdn.test();
};

// exports

module.exports = Target;
