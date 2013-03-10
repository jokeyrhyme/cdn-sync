// Node.JS standard modules

var fs = require('fs'),
    path = require('path');

// 3rd-party modules

var Q = require('q'),
    AWS = require('aws-sdk');

// custom modules

var File = require(path.join(__dirname, 'libs', 'file')),
    Queue = require(path.join(__dirname, 'libs', 'queue')),
    Worker = require(path.join(__dirname, 'libs', 'worker'));

// promise-bound anti-callbacks

var readdir = Q.nfbind(fs.readdir),
    stat = Q.nfbind(fs.stat);

// this module

var config = require(path.join(__dirname, 'libs', 'config')),
    queue = new Queue(),
    workers = [],
    files = [],
    cwd = process.cwd(),
    crd = ''; // current relative directory

config.targets.forEach(function(target) {
  target.setQueue(queue);
});

// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walkDir = function(dir, done) {
  var dfrd = Q.defer(),
      results = [];

  readdir(dir).done(function(list) {
    var pending = list.length;
    if (!pending) {
      return dfrd.resolve(results);
    }
    list.forEach(function(file) {
      file = dir + '/' + file;
      stat(file).done(function(stat) {
        if (stat && stat.isDirectory()) {
          walkDir(file).done(function(res) {
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
              path: file.replace(config.path + path.sep, ''),
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

// create worker threads

workers.push(new Worker(queue));
workers.push(new Worker(queue));

// check target CDNs for files that already exist there

config.targets.forEach(function (target) {
  target.listFiles().done(function() {
    target.dfrds.listRemotes.resolve();
  });
  target.synchronise();
});

// traverse directory hunting for files

walkDir(cwd)
    .then(function (files) {
      // wait for files to be hashed and MIME'd
      return Q.all(files.map(function (file) {
        return file.promise;
      }));
    })
    .then(function (files) {
      // wait for files to be checked against targets
      var checks = [];
      config.targets.forEach(function (target) {
        files.forEach(function (file) {
          checks.push(target.checkFile(file.clone()));
        });
      });
      return Q.all(checks);
    })
    .done(function () {
      console.log('DONE!');
      config.targets.forEach(function (target) {
        target.dfrds.files.resolve();
      });
    });

  // TODO: worker asks main thread for a CDNFile

  // TODO: worker uses CDN to process CDNFile

  // TODO: worker cleans up and then asks for next CDNFile

// TODO: use CDN to trigger post-sync clean-up (e.g. invalidation)
