/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var fs, path;
fs = require('fs');
path = require('path');

// 3rd-party modules

var Q, cli, findup;
Q = require('q');
cli = require('cli');
findup = require('findup-sync');

// custom modules

var cdnSync, Config;
cdnSync = require(path.join(__dirname, 'lib'));
Config = cdnSync.Config;

// promise-bound anti-callbacks

// this module

function init(options) {
  var target = path.join(process.cwd(), '.cdn-sync.json');
  if (options.force) {
    cli.fatal('`init` not implemented yet');
  } else {
    fs.exists(target, function (exists) {
      if (exists) {
        cli.error(target + ' already exists');
        cli.info('remove existing file or use --force');
        process.exit(1);
      } else {
        cli.fatal('`init` not implemented yet');
      }
    });
  }
}

function test() {
  var config, file;
  file = findup('.cdn-sync.json', { nocase: true });
  if (file) {
    try {
      config = Config.fromFile(file);
    } catch (err) {
      cli.fatal(err);
    }
    cli.fatal('`test` not implemented yet');
  } else {
    cli.error('.cdn-sync.json not found for ' + process.cwd());
    cli.info('use `cdn-sync init` to get started');
    process.exit(1);
  }
}

cli.parsePackageJson();
cli.parse(null, {
  '': '',
  'init' : 'create a .cdn-sync.json file in this directory',
  'test' : 'health-check on active .cdn-syn.json file',
  'go' : 'execute synchronisation (default if no command)'
});

/*jslint unparam:true*/
cli.main(function (args, options) {
  switch (cli.command) {
  case 'init':
    init(options);
    break;
  case 'test':
    test();
    break;
  default: // 'go'
    test();
    cli.fatal('not implemented yet');
  }
});
/*jslint unparam:false*/
