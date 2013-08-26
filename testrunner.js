/*jslint es5:true, indent:2, maxlen:80, node:true, nomen:true*/
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

var glob, Mocha;
glob = require('glob');
Mocha = require('mocha');

// custom modules

// promise-bound anti-callbacks

// this module

var mocha;
mocha = new Mocha({
  ui: 'tdd'
});

glob('**/*.js', {
  cwd: path.join(__dirname, 'test'),
  mark: true
}, function (err, files) {
  if (err) {
    throw err;
  }
  files = files.filter(function (file) {
    return file[file.length - 1] !== '/';
  });
  files.forEach(function (file) {
    mocha.addFile(path.join(__dirname, 'test', file));
  });
  mocha.run();
});
