/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';

// Node.JS standard modules

var path = require('path');

// 3rd-party modules

// custom modules

var Action = require(path.join(__dirname, 'action'));

// promise-bound anti-callbacks

// this module

/**
 * represents a collection of actions
 * @constructor
 * @param {Array} [actions] initial set of Action objects
 */
function ActionList(actions) {
  var arr = [];
  if (Array.isArray(actions)) {
    arr.push.apply(arr, actions);
  }

  Object.keys(ActionList.prototype).forEach(function (method) {
    arr[method] = ActionList.prototype[method];
  });

  return arr;
}
ActionList.prototype = {};
ActionList.prototype.constructor = ActionList;

/**
 * populate self based on comparison of two lists of files
 * @param {FileList} local list of files at the local source
 * @param {FileList} remote list of files at the remote destination
 */
ActionList.prototype.compareFileLists = function (local, remote) {
  var index, otherFile, me;
  me = this;
  local.forEach(function (file) {
    index = remote.indexOf(file.path);
    if (index === -1) {
      me.push(new Action({ file: file, doUpload: true }));
    } else {
      otherFile = remote[index];
      if (file.size !== otherFile.size) {
        me.push(new Action({ file: file, doUpload: true }));
      } else if (file.md5 !== otherFile.md5) {
        me.push(new Action({ file: file, doUpload: true }));
      } else if (file.mime !== otherFile.mime) {
        me.push(new Action({ file: file, doHeaders: true }));
      }
    }
  });
  remote.forEach(function (file) {
    index = local.indexOf(file.path);
    if (index === -1) {
      me.push(new Action({ file: file, doDelete: true }));
    }
  });
};

// exports

module.exports = ActionList;
