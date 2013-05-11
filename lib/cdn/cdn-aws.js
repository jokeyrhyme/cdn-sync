/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var fs = require('fs'),
  path = require('path');

// 3rd-party modules

var AWS = require('aws-sdk');

// custom modules

var CDN = require(path.join(__dirname, 'cdn'));

// this module

/**
 * storage backend implementation for AWS CloudFront and S3
 * @constructor
 */
var CDN_AWS = function () {
  return this;
};

CDN_AWS.prototype = Object.create(CDN.prototype);

// exports

module.exports = CDN;
