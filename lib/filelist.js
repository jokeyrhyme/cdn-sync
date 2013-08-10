/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';

// Node.JS standard modules

var fs = require('fs'),
  path = require('path');

// 3rd-party modules

var Q = require('q'),
  glob = require('glob');

// custom modules

var File, GzippedFile;
File = require(path.join(__dirname, 'file'));
GzippedFile = require(path.join(__dirname, 'gzippedfile'));

// promise-bound anti-callbacks

var stat = Q.nbind(fs.stat, fs);

// this module

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
   * @param {String} path identifying path of the desired File
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

  Object.keys(FileList.prototype).forEach(function (method) {
    arr[method] = FileList.prototype[method];
  });

  return arr;
}
FileList.prototype = {};

/**
 * does not change this FileList, provides a new one for the desired strategy
 * @param {Array|String} strategy
 * @returns {Promise} passed a new {FileList}
 */
FileList.prototype.applyStrategy = function (strategy) {
  var dfrd, fl, gzips;
  dfrd = Q.defer();

  if (typeof strategy === 'string' && strategy) {
    strategy = [strategy];
  }
  if (!Array.isArray(strategy) || !strategy.length) {
    dfrd.reject(new TypeError('provided strategy should be Array or String'));
    return dfrd.promise;
  }
  if (strategy.indexOf('clone') !== -1) {
    dfrd.resolve(new FileList(this));
    return dfrd.promise;
  }
  if (strategy.indexOf('gzip') !== -1) {
    gzips = this.map(function (file) {
      file.file = file;
      return new GzippedFile(file);
    });
    fl = new FileList(gzips);
    fl.ready().then(function () {
      dfrd.resolve(fl);
    }, dfrd.reject);
  }

  return dfrd.promise;
};

/**
 * @param {String} dir directory to start traversing
 */
FileList.fromPath = function (dir) {
  var dfrd = Q.defer();
  glob('**/*', { cwd: dir, mark: true }, function (err, files) {
    var results;
    if (err) {
      dfrd.reject(err);
      return;
    }
    results = [];
    files = files.filter(function (file) {
      return file[file.length - 1] !== '/';
    });
    files.forEach(function (file) {
      file = path.join(dir, file);
      stat(file).done(function (stat) {
        var fl;
        results.push(new File({
          localPath: file,
          path: file.replace(dir + path.sep, ''),
          size: stat.size
        }));
        if (files.length === results.length) {
          fl = new FileList(results);
          fl.ready().then(function () { // onSuccess
            dfrd.resolve(fl);
          }, function (err) { // onError
            dfrd.reject(err);
          });
        }
      });
    });
  });
  return dfrd.promise;
};

// exports

module.exports = FileList;
