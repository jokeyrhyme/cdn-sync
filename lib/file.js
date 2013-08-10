/*jslint es5:true, indent:2, maxlen:80, node:true*/
'use strict';
// Node.JS standard modules

var crypto = require('crypto'),
  fs = require('fs');

// 3rd-party modules

var Q = require('q'),
  mmm = require('mmmagic'),
  magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

// custom modules

// promise-bound anti-callbacks

var detectFile = Q.nbind(magic.detectFile, magic);

// this module

/**
 * represents an individual file in the CDN, with required actions
 * @constructor
 */
var File = function (options) {
  var self = this,
    dfrd = Q.defer(),
    promises = [];

  options = options || {};

  this.localPath = options.localPath || '';
  this.path = options.path || '';
  this.mime = options.mime || '';
  this.md5 = options.md5 || '';
  this.size = options.size || 0;
  this.headers = null; // only those missing from destination
  this.promise = dfrd.promise;

  if (options.headers) {
    this.headers = JSON.parse(JSON.stringify(options.headers));
  } else {
    this.headers = {};
  }

  if (this.localPath) {
    if (!this.size) {
      promises.push(this.detectSize());
    }
    if (!this.mime) {
      promises.push(this.detectMIME());
    }
    if (!this.md5) {
      promises.push(this.calculateMD5());
    }
  }

  Q.all(promises).then(function () {
    process.nextTick(function () {
      dfrd.resolve(self);
    });
  }).done();

  return this;
};

File.prototype.constructor = File;

File.prototype.clone = function () {
  return new this.constructor(this);
};

File.prototype.toString = function () {
  var string = '',
    mime = this.mime;

  mime = mime.replace('application', 'app.');
  mime = mime.replace('javascript', 'js.');
  string += this.path + ': ';
  string += '#' + this.md5.substr(0, 6) + ' ';
  string += this.size + ' ';
  string += mime;
  return string;
};

File.prototype.setMIME = function (mime) {
  var parts,
    ext;

  if (mime.indexOf('text/') === 0) {
    parts = this.path.split('.');
    ext = parts[parts.length - 1];
    switch (ext) {
    case 'css':
      this.mime = 'text/css';
      break;
    case 'html':
      this.mime = 'text/html';
      break;
    case 'js':
      this.mime = 'application/javascript';
      break;
    case 'xml':
      this.mime = 'application/xml';
      break;
    default:
      this.mime = mime;
    }
  } else if (mime.indexOf('x-empty') !== -1) {
    this.mime = 'text/plain';
  } else {
    this.mime = mime;
  }
  this.headers['Content-Type'] = this.mime;
};

File.prototype.detectMIME = function (buffer) {
  var self = this,
    dfrd = Q.defer();

  detectFile(buffer || this.localPath)
    .then(function (result) {
      self.setMIME(result);
      dfrd.resolve();
    }).fail(function (err) {
      dfrd.reject(err);
    }).done();

  return dfrd.promise;
};

File.prototype.detectSize = function () {
  var self = this,
    dfrd = Q.defer();

  fs.stat(this.localPath, function (err, stat) {
    if (err) {
      dfrd.reject(err);
    } else {
      self.size = stat.size;
      dfrd.resolve();
    }
  });

  return dfrd.promise;
};

File.prototype.calculateMD5 = function () {
  var self = this,
    dfrd = Q.defer(),
    md5 = crypto.createHash('md5'),
    rs;

  rs = this.createReadStream();
  rs.on('error', function (err) {
    dfrd.reject(err);
  });
  rs.on('data', function (data) {
    md5.update(data);
  });
  rs.once('end', function () {
    self.md5 = md5.digest('hex');
    dfrd.resolve();
  });
  return dfrd.promise;
};

File.prototype.createReadStream = function () {
  if (!this.localPath) {
    throw new Error('File has no localPath');
  }
  return fs.createReadStream(this.localPath);
};

File.prototype.getBuffer = function () {
  var dfrd, self;
  self = this;
  dfrd = Q.defer();

  try {
    fs.readFile(this.localPath, function (err, data) {
      if (err) {
        dfrd.reject(err);
      } else if (data.length !== self.size) {
        dfrd.reject(new Error('file size mismatch, re-run'));
      } else {
        dfrd.resolve(data);
      }
    });
  } catch (err) {
    dfrd.reject(err);
  }

  return dfrd.promise;
};

// exports

module.exports = File;
