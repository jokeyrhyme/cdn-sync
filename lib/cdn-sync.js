/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
// 'use strict';

// Node.JS standard modules

var path = require('path');

// 3rd-party modules

// custom modules

var Action, ActionList, File, FileList;

Action = require(path.join(__dirname, 'action'));
ActionList = require(path.join(__dirname, 'actionlist'));
File = require(path.join(__dirname, 'file'));
FileList = require(path.join(__dirname, 'filelist'));

// promise-bound anti-callbacks

// this module

// exports

module.exports = {
  Action: Action,
  ActionList: ActionList,
  File: File,
  FileList: FileList
};
