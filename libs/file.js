// Node.JS standard modules

var crypto = require('crypto'),
    fs = require('fs');

// 3rd-party modules

var Q = require('q'),
    mmm = require('mmmagic'),
    magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

// custom modules

// this module

/**
 * represents an individual file in the CDN, with required actions
 * @constructor
 */
var File = function(options) {
  var self = this,
      dfrd = Q.defer(),
      promises = [];

  this.localPath = options.localPath || '';
  this.path = options.path || '';
  this.mime = '';
  this.md5 = '';
  this.size = options.size;
  this.action = options.action || ''; // 'PUT' or 'DELETE'
  this.headers = null; // only those missing from destination
  this.promise = dfrd.promise;
  this.isDirty = options.isDirty || false;

  if (options.headers) {
    this.headers = JSON.parse(JSON.stringify(options.headers));
  } else {
    this.headers = {};
  }

  if (options.mime) {
    this.mime = options.mime;
  } else if (this.localPath) {
    promises.push(this.detectMIME());
  }

  if (options.md5) {
    this.md5 = options.md5;
  } else if (this.localPath) {
    promises.push(this.calculateMD5());
  }

  Q.all(promises).then(function() {
    process.nextTick(function() {
      dfrd.resolve(self);
    });
  });

  return this;
};

File.prototype.clone = function() {
  return new File(this);
};

File.prototype.toString = function() {
  var string = '',
      mime = this.mime;

  mime = mime.replace('application', 'app.');
  mime = mime.replace('javascript', 'js.');
  if (this.action === 'PUT') {
    string += '+';
  } else if (this.action === 'DELETE') {
    string += '-';
  } else if (Object.keys(this.headers).length) {
    string += '*';
  }
  string += this.path + ': ';
  string += '#' + this.md5.substr(0, 6) + ' ';
  string += this.size + ' ';
  string += mime;
  return string;
};

File.prototype.setMIME = function(mime) {
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
};

File.prototype.detectMIME = function() {
  var self = this,
      dfrd = Q.defer();

  Q.ninvoke(magic, 'detectFile', this.localPath)
  .then(function(result) {
    self.setMIME(result);
    dfrd.resolve();
  }).fail(function(err) {
    dfrd.reject(err);
  }).done();
  return dfrd.promise;
};

File.prototype.calculateMD5 = function() {
  var self = this,
      dfrd = Q.defer(),
      md5 = crypto.createHash('md5'),
      rs;

  rs = fs.createReadStream(this.localPath);
  rs.on('error', function(err) {
    dfrd.reject(err);
  });
  rs.on('data', function(data) {
    md5.update(data);
  });
  rs.once('end', function() {
    self.md5 = md5.digest('hex');
    dfrd.resolve();
  });
  return dfrd.promise;
};

// exports

module.exports = File;
