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

  /**
   * populate self based on comparison of two lists of files
   * @param {FileList} local list of files at the local source
   * @param {FileList} remote list of files at the remote destination
   */
  arr.compareFileLists = function (local, remote) {
    var index, otherFile;
    local.forEach(function (file) {
      index = remote.indexOf(file.path);
      if (index === -1) {
        arr.push(new Action({ file: file, doUpload: true }));
      } else {
        otherFile = remote[index];
        if (file.size !== otherFile.size) {
          arr.push(new Action({ file: file, doUpload: true }));
        } else if (file.md5 !== otherFile.md5) {
          arr.push(new Action({ file: file, doUpload: true }));
        } else if (file.mime !== otherFile.mime) {
          arr.push(new Action({ file: file, doHeaders: true }));
        }
      }
    });
    remote.forEach(function (file) {
      index = local.indexOf(file.path);
      // TODO: handle GZIP'ed files that aren't locally present
      if (index === -1) {
        arr.push(new Action({ file: file, doDelete: true }));
      }
    });
  };

  return arr;
}
ActionList.prototype = {};

// exports

module.exports = ActionList;
