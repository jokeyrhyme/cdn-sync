// Node.JS standard modules

var fs = require('fs'),
  path = require('path');

// 3rd-party modules

var findup = require('findup-sync');

// custom modules

var Target = require(path.join(__dirname, 'target'));

// this module

// find .cdn-sync.json

var filename = '.cdn-sync.json',
  file = findup(filename, { nocase: true });

var config = {};

if (file) {
  try {
    config = require(file);
  } catch (ex) {
    console.error('.cdn-sync.json in unexpected format');
    process.exit(1);
  }
} else {
  console.error('.cdn-sync.json could not be found');
  process.exit(1);
}

config.path = path.dirname(file);

// TODO: confirm that configuration is valid

if (!config.targets || !config.targets.length || !config.targets.forEach) {
  console.error('.cdn-sync.json defines no targets');
  process.exit(1);
}

// TODO: confirm that credentials are valid

// convert target definitions into objects

config.targets.forEach(function(value, index, array) {
  array[index] = new Target(value);
});

// exports

module.exports = config;
