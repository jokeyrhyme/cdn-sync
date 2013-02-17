// Node.JS standard modules

var fs = require('fs'),
    http = require('http'),
    path = require('path');

// 3rd-party modules

var Q = require('q'),
    AWS = require('aws-sdk');

// custom modules

// promise-bound anti-callbacks

function request(options) {
  var dfrd = Q.defer(),
      req;

  req = http.request(options, function(res) {
    dfrd.resolve(res);
  });
  req.on('error', function(e) {
    dfrd.reject(e);
  });
  req.end();

  return dfrd.promise;
}

// this module

/**
 *
 */
var Target = function(config) {
  this.cfg = config;
  this.files = [];
  this.s3 = new AWS.S3.Client({
    accessKeyId: config.principle,
    secretAccessKey: config.credential,
    region: config.region,
    sslEnabled: true
  });
  return this;
};

Target.prototype.setQueue = function(queue) {
  this.queue = queue;
};

Target.prototype._checkFile = function(file) {
  var self = this,
      dfrd = Q.defer(),
      host = this.cfg.bucket + '.' + this.s3.endpoint.host,
      options = {
        hostname: host,
        path: '/' + file.path
      },
      req;

  console.log(file);
  request(options)
  .then(function(res) {
    if (res.statusCode !== 200) {
      file.action = 'PUT';
      file.isDirty = true;
    }
    //console.log(res.headers);
    if (res.headers['content-type'] !== file.mime) {
      file.headers['Content-Type'] = file.mime;
      file.isDirty = true;
    }
    if (file.isDirty) {
      self.files.push(file);
    }
    dfrd.resolve();
  }).fail(function(e) {
    dfrd.reject(e.message);
  });
  return dfrd.promise;
};

Target.prototype.checkFile = function(file) {
  var self = this,
      job;

  job = this.queue.push(function() {
    return self._checkFile(file);
  });
  return job.promise;
};

// exports

module.exports = Target;
