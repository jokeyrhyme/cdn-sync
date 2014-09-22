/*jslint indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var fs, path;
fs = require('fs');
path = require('path');

// 3rd-party modules

var Q, async, cli, findup, ProgressBar;
Q = require('q');
async = require('async');
cli = require('cli');
findup = require('findup-sync');
ProgressBar = require('progress');

// custom modules

var cdnSync, ActionList, Config, FileList;
cdnSync = require(path.join(__dirname, 'lib'));
ActionList = cdnSync.ActionList;
Config = cdnSync.Config;
FileList = cdnSync.FileList;

// promise-bound anti-callbacks

// this module

var localFiles;

// lift the default socket cap from 5 to Infinity
require('http').globalAgent.maxSockets = Infinity;
require('https').globalAgent.maxSockets = Infinity;

function init(options) {
  var target = path.join(process.cwd(), '.cdn-sync.json');
  if (options.force) {
    cli.fatal('`init` not implemented yet');
  } else {
    fs.exists(target, function (exists) {
      if (exists) {
        cli.info('remove existing file or use --force');
        cli.fatal(target + ' already exists');
      } else {
        cli.fatal('`init` not implemented yet');
      }
    });
  }
}

function testConfig() {
  var config, dfrd, file;
  dfrd = Q.defer();
  file = findup('.cdn-sync.json', { nocase: true });
  if (file) {
    try {
      config = Config.fromFile(file);
    } catch (err) {
      cli.fatal(err);
    }
    config.validate().fail(function (err) {
      cli.fatal(err);
    });
    config.testTargets().fail(function () {
      cli.fatal('configured target fails basic tests');
    }).done(function () {
      cli.ok('configured targets pass basic tests');
      dfrd.resolve(config);
    });
  } else {
    cli.info('use `cdn-sync init` to get started');
    cli.fatal('.cdn-sync.json not found for ' + process.cwd());
  }
  return dfrd.promise;
}

function eachTarget(t, options, done) {
  var actions, info, theseLocalFiles, bar;
  info = function (msg) {
    cli.info(t.label + ': ' + msg);
  };
  t.on('progress', function (action) {
    cli.info(action.toString());
  });

  cli.info('applying "' + t.strategy + '" strategy to local file(s)');
  localFiles.applyStrategy(t.strategy).then(function (files) {
    theseLocalFiles = files;
    info('scanning...');
    t.cdn.once('files.length', function (length) {
      bar = new ProgressBar('[:bar] :current/:total :percent :elapsed :etas', {
        total: length
      });
    });
    t.cdn.on('file:fixed', function () {
      bar.tick();
    });
    return t.cdn.listFiles();
  }).then(function (remoteFiles) {
    actions = new ActionList();
    actions.compareFileLists(theseLocalFiles, remoteFiles);
    info(actions.length + ' synchronisation action(s) to perform');
    return t.cdn.executeActions(actions, options);

  }).fail(function (err) {
    cli.fatal(err);
  }).done(function () {
    done();
  });
}

function go(options) {
  var config;
  testConfig().then(function (cfg) {
    config = cfg;
    cli.info('content root: ' + config.cwd);
    return FileList.fromPath(config.cwd);
  }).then(function (files) {
    localFiles = files;
    cli.info(localFiles.length + ' file(s) found here');
    async.eachLimit(config.targets, 1, function (t, done) {
      eachTarget(t, options, done);
    }, function () {
      cli.ok('all done!');
    });
  }).done();
}

cli.parsePackageJson();
cli.parse({
  'dry-run': ['n', 'make no changes, only simulate actions']
}, {
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
    testConfig();
    break;
  default: // 'go'
    go(options);
  }
});
/*jslint unparam:false*/
