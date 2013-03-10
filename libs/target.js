// Node.JS standard modules

var fs = require('fs'),
    http = require('http'),
    path = require('path');

// 3rd-party modules

var _ = require('underscore'),
    Q = require('q'),
    color = require('colorful').color,
    logging = require('colorful').logging,
    AWS = require('aws-sdk');

// custom modules

var File = require(path.join(__dirname, 'file'));

// promise-bound anti-callbacks

// this module

/**
 *
 */
var Target = function(config) {
  this.cfg = config;
  this.files = [];
  this.oldFiles = [];
  this.deletes = [];
  this.s3 = new AWS.S3.Client({
    credentials: {
      accessKeyId: config.principal,
      secretAccessKey: config.credential
    },
    region: config.region,
    sslEnabled: true
  });
  this.dfrds = {
    files: Q.defer(),
    listRemotes: Q.defer()
  };
  this.promises = {
    files: this.dfrds.files.promise,
    listRemotes: this.dfrds.listRemotes.promise
  };
  return this;
};

Target.prototype.setQueue = function(queue) {
  this.queue = queue;
  this.checkFile = this.queue.bind(this, this.checkFile);
  this.deleteFile = this.queue.bind(this, this.deleteFile);
  this.listFiles = this.queue.bind(this, this.listFiles);
};

Target.prototype.checkFile = function(file) {
  var self = this,
      dfrd = Q.defer(),
      host = this.cfg.bucket + '.' + this.s3.endpoint.host,
      options = {
        hostname: host,
        path: '/' + file.path
      };

  req = http.request(options, function(res) {
    logging.start(file.path + ' -> '+ self.cfg.bucket);
    if (res.statusCode !== 200) {
      logging.warn(res.statusCode);
      file.action = 'PUT';
      file.isDirty = true;
    } else if (res.headers['content-length'] !== String(file.size)) {
      logging.warn(res.headers['content-length']);
      file.action = 'PUT';
      file.isDirty = true;
    } else if (res.headers.etag !== ('"' + file.md5 + '"')) {
      logging.warn(res.headers.etag);
      file.action = 'PUT';
      file.isDirty = true;
    } else if (res.headers['content-type'] !== file.mime) {
      logging.warn(res.headers['content-type']);
      file.headers['Content-Type'] = file.mime;
      file.isDirty = true;
    }
    if (file.isDirty) {
      if (file.action === 'PUT') {
        file.headers['Content-Type'] = file.mime;
      }
    }
    self.files.push(file);
    logging.end(String(file));
    dfrd.resolve();
  });

  req.on('error', function(err) {
    dfrd.reject(err.message);
  });

  req.end();

  return dfrd.promise;
};

Target.prototype.listFiles = function(options) {
  var self = this,
      dfrd = Q.defer();

  options = options || {};
  options.Bucket = this.cfg.bucket;

  this.s3.listObjects(options, function(err, res) {
    if (err) {
      return dfrd.reject(err);
    }
    if (!Array.isArray(res.Contents)) {
      return dfrd.resolve();
    }
    res.Contents.forEach(function(obj) {
      var file;
      if (obj.Key[obj.Key.length - 1] !== '/') {
        file = new File({
          path: obj.Key,
          md5: obj.ETag,
          size: obj.Size
        });
        self.oldFiles.push(file);
      }
    });
    if (res.IsTruncated) {
      options.Marker = self.oldFiles[self.oldFiles.length - 1].path;
      self.listFiles(options).done(function() {
        dfrd.resolve();
      });
    } else {
      dfrd.resolve();
    }
  });
  return dfrd.promise;
};

/**
 */
Target.prototype.deleteFile = function(path) {
  var self = this,
      dfrd = Q.defer();

  return dfrd.promise;
};

Target.prototype.synchronise = function() {
  var self = this,
      dfrd = Q.defer();

  Q.all([
        this.promises.files,
        this.promises.listRemotes
      ]).done(function() {
    console.log('synchronise');
    self.oldFiles.forEach(function(remote) {
      var local = _.find(self.files, function(file) {
        return file.path === remote.path;
      });

      if (!local) {
        self.deletes.push(remote);
      }
    });
    console.log('delete', self.deletes);

        // TODO: delete all files in this.deletes
        // TODO: upload all PUT files in this.files
        // TODO: fix metadata / headers for remaining dirty files in this.files
        // TODO: generate invalidation list for files modified just now
  });

  return dfrd.promise;
};

// exports

module.exports = Target;
