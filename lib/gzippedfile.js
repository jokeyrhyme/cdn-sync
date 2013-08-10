/*jslint es5:true, indent:2, maxlen:80, node:true, nomen:true*/
'use strict';
// Node.JS standard modules

var crypto, fs, path, zlib;
crypto = require('crypto');
fs = require('fs');
path = require('path');
zlib = require('zlib');

// 3rd-party modules

var Q = require('q');

// custom modules

var bufferUtils, File;
bufferUtils = require(path.join(__dirname, 'bufferutils'));
File = require(path.join(__dirname, 'file'));

// promise-bound anti-callbacks

// this module

/**
 * represents an individual Gzipped-file in the CDN, with required actions
 * @constructor
 */
var GzippedFile = function (options) {
  var self = this,
    dfrd = Q.defer();

  options = options instanceof File ? File.clone() : {};
  // removing attributes that need post-Gzip calculation
  delete options.mime;
  delete options.size;
  delete options.md5;

  File.call(this, options);

  if (!options.file || !options.file instanceof File) {
    throw new Error('GzippedFile not linked to a File');
  }

  this.promise = dfrd.promise;

  this.file = options.file;
  this.file.promise.then(function (file) {
    self.setMIME(file.mime);
    return [
      self.getBuffer(),
      self.calculateMD5()
    ];
  }).spread(function (buffer) {
    self.size = buffer.length;
    process.nextTick(function () {
      dfrd.resolve(self);
    });
  });

  return this;
};

GzippedFile.prototype = Object.create(File.prototype);

GzippedFile.prototype.constructor = GzippedFile;

GzippedFile.prototype.setMIME = function (mime) {
  File.prototype.setMIME.call(this, mime);
  this.headers['Content-Encoding'] = 'gzip';
};

GzippedFile.prototype.createReadStream = function () {
  var gzip;

  gzip = zlib.createGzip({
    level: 9,
    memLevel: 9
  });

  this.file.createReadStream().pipe(gzip);
  return gzip;
};

GzippedFile.prototype.getBuffer = function () {
  var gzip;
  gzip = this.createReadStream();

  return bufferUtils.fromStream(gzip);
};

// exports

module.exports = GzippedFile;
