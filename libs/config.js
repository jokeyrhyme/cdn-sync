// Node.JS standard modules

var fs = require('fs'),
    path = require('path');

// find .cdn-sync.json

var filename = '.cdn-sync.json';

// TODO: confirm that isRoot test (below) works in Windows

var cwd = __dirname,
    file = path.join(cwd, filename),
    isExists = fs.existsSync(file),
    isRoot = fs.realpathSync(cwd) === '/';

while (!isExists && !isRoot) {
  cwd = path.join(cwd, '..');
  file = path.join(cwd, filename);
  isExists = fs.existsSync(file);
  isRoot = fs.realpathSync(cwd) === '/';
}

var config = {};

if (isExists) {
  try {
    config = require(file);
  } catch (ex) {
    console.error('.cdn-sync.json in unexpected format');
  }
} else {
  console.error('.cdn-sync.json could not be found');
}

// exports

module.exports = exports = {};