/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var Q = require('q'),
  AWS = require('aws-sdk');

// custom modules

var Queue = require(path.join(__dirname, 'lib', 'queue')),
  Worker = require(path.join(__dirname, 'lib', 'worker')),
  cdnSync = require(path.join(__dirname, 'lib', 'cdn-sync'));

// promise-bound anti-callbacks

// this module

var config = require(path.join(__dirname, 'lib', 'config')),
  queue = new Queue(),
  workers = [],
  cwd = process.cwd(); // current relative directory

config.targets.forEach(function (target) {
  target.setQueue(queue);
});

// create worker threads

workers.push(new Worker(queue));
workers.push(new Worker(queue));

// check target CDNs for files that already exist there

config.targets.forEach(function (target) {
  target.listFiles().done(function () {
    target.dfrds.listRemotes.resolve();
  });
  target.synchronise();
});

// traverse directory hunting for files

cdnSync.FileListing.fromPath(cwd)
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

// TODO: once invalidation lists have been compiled, queue/issue them one by one
