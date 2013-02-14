// Node.JS standard modules

// 3rd-party modules

// custom modules

// this module

/**
 * represents an individual file in the CDN, with required actions
 * @constructor
 */
var File = function(path) {
  this.path = path || '';
  this.action = ''; // 'PUT' or 'DELETE'
  this.headers = {}; // only those missing from destination
  return this;
};

File.prototype.setMIME = function(mime) {
  var parts,
      ext;
  if (mime === 'text/plain') {
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
  } else {
    this.mime = mime;
  }
};

// exports

module.exports = exports = File;
