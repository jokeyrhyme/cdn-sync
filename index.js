// Node.JS standard modules

var fs = require('fs'),
    path = require('path');

// 3rd-party modules

var Q = require('q'),
    AWS = require('aws-sdk'),
    mmm = require('mmmagic'),
    magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

// custom modules

var File = require(path.join(__dirname, 'libs', 'file')),
    Queue = require(path.join(__dirname, 'libs', 'queue')),
    Worker = require(path.join(__dirname, 'libs', 'worker'));

// promise-bound anti-callbacks

var readdir = Q.nfbind(fs.readdir),
    stat = Q.nfbind(fs.stat),
    detectFile = Q.nfbind(magic.detectFile);

// this module

var config = require(path.join(__dirname, 'libs', 'config')),
    queue = new Queue(),
    worker,
    files = [],
    cwd = process.cwd(),
    crd = ''; // current relative directory

worker = new Worker(queue);
worker = new Worker(queue);

// TODO: scan all visible files in directory to be synchronised

function processFiles(crd, files) {
  files.forEach(function(filename) {
    if (filename[0] === '.') {
      return; // skip hidden files
    }
    stat(path.join(cwd, crd, filename)).then(function(stats) {
      var nextDir,
          nextRel,
          file;

      if (stats.isDirectory()) {
        nextRel = path.join(crd, filename);
        nextDir = path.join(cwd, nextRel);
        readdir(nextDir).then(function(files) {
          processFiles(nextRel, files);
        });
      }
      if (stats.isFile()) {
        file = new File(path.join(crd, filename));
        Q.ninvoke(magic, 'detectFile', path.join(cwd, crd, filename)).then(function(result) {
          file.setMIME(result);
          config.targets.forEach(function(target) {
            queue.push(function() {
              target.checkFile(file);
            });
          });
        });
      }
    });
  });
}

readdir(cwd).then(function(files) {
  processFiles(crd, files);
});

  // TODO: populate array of CDNFiles

// TODO: create worker threads

  // TODO: worker asks main thread for a CDNFile

  // TODO: worker uses CDN to process CDNFile

  // TODO: worker cleans up and then asks for next CDNFile

// TODO: use CDN to trigger post-sync clean-up (e.g. invalidation)
