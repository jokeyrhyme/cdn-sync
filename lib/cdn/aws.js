/*jslint es5:true, indent:2, maxlen:80, node:true, nomen:true*/
'use strict';

// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var Q, AWS, async;
Q = require('q');
AWS = require('aws-sdk');
async = require('async');

// custom modules

var File, FileList;
File = require(path.join(__dirname, '..', 'file'));
FileList = require(path.join(__dirname, '..', 'filelist'));

// promise-bound anti-callbacks

// this module

/**
 * @param {Object} options
 * @returns {CDN}
 * @constructor
 */
var CDN = function (options) {
  this.cfg = options || {};
  this.api = new AWS.S3(options);
  return this;
};

CDN.prototype.executeActions = function (actions) {};

/**
 * @param {File} file
 */
CDN.prototype.fixFile = function (file) {
  var self, dfrd, options;
  dfrd = Q.defer();

  if (file.mime && typeof file.mime === 'string') {
    dfrd.resolve();
    return dfrd.promise;
  }

  options = JSON.parse(JSON.stringify(this.cfg)) || {};
  options.Key = file.path;
  this.api.headObject(options, function (err, res) {
    if (err) {
      return dfrd.reject(err);
    }
    file.setMIME(res.ContentType);
    dfrd.resolve();
  });

  // TODO: check cache headers and permissions
  return dfrd.promise;
};

CDN.prototype.fixFiles = function (files) {
  var self, dfrd;
  self = this;
  dfrd = Q.defer();

  async.eachLimit(files, 5, function (file, done) { // perItem
    self.fixFile(file).done(done, done);
  }, function (err) { // onComplete
    if (err) {
      dfrd.reject(err);
    } else {
      dfrd.resolve(files);
    }
  });

  return dfrd.promise;
};

/**
 * grabs the initial list of Files, but they will be missing metadata
 * @param {Object} [options]
 * @returns {Promise}
 */
CDN.prototype.listAllFiles = function (options) {
  var self, dfrd, files;
  self = this;
  dfrd = Q.defer();
  options = options || JSON.parse(JSON.stringify(this.cfg));
  files = new FileList();

  this.api.listObjects(options, function (err, res) {
    if (err) {
      return dfrd.reject(err);
    }
    if (!Array.isArray(res.Contents)) {
      return dfrd.resolve(files);
    }
    res.Contents.forEach(function (obj) {
      var file;
      if (obj.Key[obj.Key.length - 1] !== '/') {
        file = new File({
          path: obj.Key,
          md5: obj.ETag,
          size: obj.Size
        });
        files.push(file);
      }
    });
    if (res.IsTruncated) {
      options.Marker = files[files.length - 1].path;
      self.listFiles(options).done(function () {
        dfrd.resolve(files);
      });
    } else {
      dfrd.resolve(files);
    }
  });
  return dfrd.promise;
};

CDN.prototype.listFiles = function () {
  var self, dfrd;
  self = this;
  dfrd = Q.defer();

  this.listAllFiles()
    .then(function (files) {
      return self.fixFiles(files);
    })
    .then(function (files) {
      dfrd.resolve(files);
    })
    .done();

  return dfrd.promise;
};

// exports

module.exports = CDN;
