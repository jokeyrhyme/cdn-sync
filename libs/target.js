// Node.JS standard modules

var fs = require('fs'),
    path = require('path');

// 3rd-party modules

var Q = require('q'),
    AWS = require('aws-sdk');

// custom modules

// promise-bound built-ins

var readdir = Q.nfbind(fs.readdir);

// this module

/**
 *
 */
var Target = function(config) {
  this.cfg = config;
  this.files = [];
  return this;
};

Target.prototype.checkFile = function(file) {
  this.files.push(file);
  console.log(file);
};

// exports

module.exports = exports = Target;
