/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var fs, path;
fs = require('fs');
path = require('path');

// 3rd-party modules

var Q, async, cli, findup;
Q = require('q');
async = require('async');
cli = require('cli');
findup = require('findup-sync');

// custom modules

var cdnSync, ActionList, Config, FileList;
cdnSync = require(path.join(__dirname, 'lib'));
ActionList = cdnSync.ActionList;
Config = cdnSync.Config;
FileList = cdnSync.FileList;

// promise-bound anti-callbacks

// this module

var localFiles;

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
  var config, dfrd, file;
  dfrd = Q.defer();
  file = findup('.cdn-sync.json', { nocase: true });
  if (file) {
    try {
      config = Config.fromFile(file);
    } catch (err) {
      cli.fatal(err);
    }
    config.testTargets().fail(function () {
      cli.fatal('configured target fails basic tests');
    }).done(function () {
      cli.ok('configured targets pass basic tests');
      dfrd.resolve(config);
    });
  } else {
    cli.error('.cdn-sync.json not found for ' + process.cwd());
    cli.info('use `cdn-sync init` to get started');
    process.exit(1);
  }
  return dfrd.promise;
}

function eachTarget(t, done) {
  var remoteFiles, actions, info;
  info = function (msg) {
    cli.info(t.label + ': ' + msg);
  };
  t.on('progress', function (progress, total) {
    cli.progress(progress, total);
  });

  t.cdn.listFiles().then(function (files) {
    remoteFiles = files;
    info(remoteFiles.length + ' remote file(s)');
    actions = new ActionList();
    actions.compareFileLists(localFiles, remoteFiles);
    info(actions.length + ' synchronisation action(s) to perform');
    return t.cdn.executeActions(actions);

  }).then(function () {
    done();

  }).fail(function (err) {
    cli.fatal(err);
  }).done();
}

function go() {
  var config;
  test().then(function (cfg) {
    config = cfg;
    cli.info('content root: ' + config.cwd);
    return FileList.fromPath(config.cwd);
  }).then(function (files) {
    localFiles = files;
    cli.info(localFiles.length + ' file(s) found here');
    async.eachLimit(config.targets, 1, eachTarget, function () {
      cli.ok('all done!');
    });
  }).done();
}

cli.parsePackageJson();
cli.parse(null, {
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
    go();
  }
});
/*jslint unparam:false*/
