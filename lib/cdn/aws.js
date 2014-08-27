/*jslint indent:2, maxlen:80, node:true, nomen:true*/
'use strict';

// Node.JS standard modules

var events, path;
events = require('events');
path = require('path');

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

CDN.prototype = Object.create(events.EventEmitter.prototype);

CDN.prototype.executeBulkDelete = function (actions) {
  var self, dfrd, options, currentBatch, nextBatch, objects;
  self = this;
  dfrd = Q.defer();

  if (!Array.isArray(actions) || !actions.length) {
    dfrd.resolve();
    return dfrd.promise;
  }

  currentBatch = actions.slice(0, 1000);
  nextBatch = actions.slice(1000);

  objects = currentBatch.map(function (action) {
    return { Key: action.path };
  });

  options = {
    Bucket: this.cfg.Bucket,
    Delete: { Objects: objects }
  };

  this.api.deleteObjects(options, function (err, res) {
    // TODO: check response and errors and react intelligently
    if (err) {
      dfrd.reject(err);
    } else if (Array.isArray(res.Errors) && res.Errors.length) {
      dfrd.reject(new Error('DELETE: ' + res.Errors[0].Code));
    } else {
      currentBatch.forEach(function (action) {
        self.emit('progress', action);
      });
      self.executeBulkDelete(nextBatch).done(function () {
        dfrd.resolve();
      });
    }
  });

  return dfrd.promise;
};

CDN.prototype.executeUpload = function (action) {
  var dfrd, options, self;
  self = this;
  dfrd = Q.defer();
  options = {
    Bucket: this.cfg.Bucket,
    ContentType: action.file.headers['Content-Type'],
    Key: action.file.path
  };

  if (action.file.headers['Content-Encoding']) {
    options.ContentEncoding = action.file.headers['Content-Encoding'];
  }

  action.file.getBuffer().then(function (buffer) {
    options.Body = buffer;
    self.api.putObject(options, function (err) { // (err, res)
      if (err) {
        dfrd.reject(err);
      } else {
        self.emit('progress', action);
        dfrd.resolve();
      }
    });
  });

  return dfrd.promise;
};

CDN.prototype.executeAction = function (action) {
  var dfrd, self;
  self = this;
  dfrd = Q.defer();

  self.emit('progress', action);

  dfrd.resolve();

  return dfrd.promise;
};

CDN.prototype.executeActions = function (actions, options) {
  var self, dfrd, deleteActions, otherActions;
  self = this;
  dfrd = Q.defer();

  options = options || {};

  if (options['dry-run']) {
    actions.forEach(function (action) {
      self.emit('progress', action);
    });
    dfrd.resolve();
    return dfrd.promise;
  }

  this.totalActions = actions.length;
  if (!Array.isArray(actions) || !actions.length) {
    dfrd.resolve();
    return dfrd.promise;
  }

  deleteActions = actions.filter(function (action) {
    return action.doDelete && action.path;
  });

  otherActions = actions.filter(function (action) {
    return !action.doDelete && action.path;
  });

  if (deleteActions.length) {
    this.executeBulkDelete(deleteActions).then(function () {
      return self.executeActions(otherActions);
    }).done(function () {
      dfrd.resolve();
    });
    return dfrd.promise;
  }
  // only doHeader and doUpload actions left now

  async.eachLimit(actions, 10, function (action, done) { // perItem
    self.executeUpload(action).done(done, done);
  }, function (err) { // onComplete
    if (err) {
      dfrd.reject(err);
    } else {
      dfrd.resolve();
    }
  });

  return dfrd.promise;
};

/**
 * @param {File} file
 */
CDN.prototype.fixFile = function (file) {
  var self, dfrd, options, timer;
  self = this;
  dfrd = Q.defer();

  if (file.mime && typeof file.mime === 'string') {
    self.emit('file:fixed');
    dfrd.resolve();
    return dfrd.promise;
  }

  timer = setTimeout(function () {
    var error;
    error = new Error('fixFile took too long: ' + file.path);
    console.error(error);
    dfrd.reject(error);
  }, 15 * 1e3); // wait 15 seconds

  options = {
    Bucket: this.cfg.Bucket,
    Key: file.path
  };
  this.api.headObject(options, function (err, res) {
    try {
      if (err) {
        console.error(err);
        dfrd.reject(err);
        return;
      }
      file.setMIME(res.ContentType);
      if (res.ContentEncoding) {
        file.headers['Content-Encoding'] = res.ContentEncoding;
      }
      self.emit('file:fixed');
      dfrd.resolve();
    } catch (e) {
      console.error(e);
      dfrd.reject(e);
    }
    clearTimeout(timer);
  });

  // TODO: check cache headers and permissions
  return dfrd.promise;
};

CDN.prototype.fixFiles = function (files) {
  var self, dfrd;
  self = this;
  dfrd = Q.defer();

  async.eachLimit(files, 15, function (file, done) { // perItem
    self.fixFile(file).done(done, done);
  }, function (err) { // onComplete
    if (err) {
      console.error('fixFiles', err);
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
CDN.prototype.listAllFiles = function (files, options) {
  var self, dfrd;
  self = this;
  dfrd = Q.defer();
  options = options || {
    Bucket: this.cfg.Bucket
  };

  this.api.listObjects(options, function (err, res) {
    if (err) {
      dfrd.reject(err);
      return;
    }
    if (!Array.isArray(res.Contents)) {
      dfrd.resolve(files);
      return;
    }
    res.Contents.forEach(function (obj) {
      var file;
      if (obj.Key[obj.Key.length - 1] !== '/') {
        file = new File({
          path: obj.Key,
          md5: obj.ETag.replace(/"/g, ''), // AWS wraps in quotes, urgh
          size: obj.Size
        });
        files.push(file);
      }
    });
    if (res.IsTruncated) {
      options.Marker = files[files.length - 1].path;
      self.listAllFiles(files, options).done(function () {
        dfrd.resolve(files);
      });
    } else {
      dfrd.resolve(files);
    }
  });
  return dfrd.promise;
};

CDN.prototype.listFiles = function () {
  var self, dfrd, files;
  self = this;
  dfrd = Q.defer();

  files = new FileList();

  this.listAllFiles(files)
    .then(function (files) {
      self.emit('files.length', files.length);
      return self.fixFiles(files);
    })
    .then(function (files) {
      files.sort(function (a, b) {
        if (a.path < b.path) {
          return -1;
        }
        if (a.path > b.path) {
          return 1;
        }
        return 0;
      });
      dfrd.resolve(files);
    })
    .done();

  return dfrd.promise;
};

// exports

CDN.prototype.test = function () {
  var bucket, dfrd;
  dfrd = Q.defer();
  bucket = this.cfg.Bucket;
  this.api.headBucket({ Bucket: bucket }, function (err) { // (err, res)
    if (err) {
      dfrd.reject(new Error('access denied or missing AWS bucket: ' + bucket));
      return;
    }
    dfrd.resolve();
  });
  return dfrd.promise;
};

module.exports = CDN;
