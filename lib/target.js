/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

// 3rd-party modules

var _ = require('underscore');

// custom modules

// this module

var Target = function (obj) {
  var badStrategies;
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
  return this;
};

Target.TYPES = ['aws'];
Target.STRATEGIES = ['clone'];

// exports

module.exports = Target;
