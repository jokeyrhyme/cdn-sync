// Node.JS standard modules

// 3rd-party modules

// custom modules

/**
 * represents an individual file in the CDN, with required actions
 * @constructor
 */
var CDNFile = function(path) {
  this.path = path || '';
  this.action = 'PUT'; // or 'DELETE'
  this.headers = {}; // only those missing from destination
  return this;
};

// exports

module.exports = exports = CDNFile;