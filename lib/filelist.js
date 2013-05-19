/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';

// Node.JS standard modules

var fs = require('fs'),
  path = require('path');

// 3rd-party modules

var Q = require('q');

// custom modules

var File = require(path.join(__dirname, 'file'));

// promise-bound anti-callbacks

var readdir = Q.nbind(fs.readdir, fs),
  stat = Q.nbind(fs.stat, fs);

// this module

var initialDir = '';
// TODO: stop using this global, it's really really bad

// http://stackoverflow.com/questions/5827612
var walkDir = function (dir) {
  var dfrd = Q.defer(),
    results = [];

  readdir(dir).done(function (list) {
    var pending = list.length;
    if (!pending) {
      return dfrd.resolve(results);
    }
    list.forEach(function (file) {
      file = dir + '/' + file;
      stat(file).done(function (stat) {
        if (stat && stat.isDirectory()) {
          walkDir(file).done(function (res) {
            results = results.concat(res);
            pending -= 1;
            if (!pending) {
              dfrd.resolve(results);
            }
          });
        } else {
          pending -= 1;
          if (path.basename(file)[0] !== '.') {
            results.push(new File({
              localPath: file,
              path: file.replace(initialDir + path.sep, ''),
              size: stat.size
            }));
          }
          if (!pending) {
            dfrd.resolve(results);
          }
        }
      });
    });
  });
  return dfrd.promise;
};

/**
 * represents a collection of files
 * http://stackoverflow.com/questions/3261587
 * @constructor
 * @param {Array} [files] initial set of File objects
 */
function FileList(files) {
  var arr = [];
  if (Array.isArray(files)) {
    arr.push.apply(arr, files);
  }

  /**
   * @return {Promise} covering the promises of all contained Files
   */
  arr.ready = function () {
    return Q.all(this.map(function (file) {
      return file.promise;
    }));
  };

  /**
   * @param {String} identifying path of the desired File
   * @return {Number} index of said File if found, otherwise -1
   */
  arr.indexOf = function (path) {
    var a, aLength;
    if (typeof path !== 'string' || !path) {
      return Array.prototype.indexOf.call(arr, path);
    }
    aLength = arr.length;
    /*jslint plusplus:true*/
    for (a = 0; a < aLength; a++) {
      if (arr[a].path === path) {
        return a;
      }
    }
    /*jslint plusplus:false*/
    return -1;
  };

  return arr;
}
FileList.prototype = {};

/**
 * @param {String} dir directory to start traversing
 */
FileList.fromPath = function (dir) {
  var dfrd = Q.defer();
  initialDir = dir;
  walkDir(dir).then(function (files) { // onSuccess
    dfrd.resolve(new FileList(files));
  }, function (err) { // onError
    dfrd.reject(err);
  });
  return dfrd.promise;
};

// exports

module.exports = FileList;
