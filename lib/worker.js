/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var path = require('path');

// 3rd-party modules

var Q = require('q');

// custom modules

var Queue = require(path.join(__dirname, 'queue'));

// promise-bound anti-callbacks

// this module

var Worker = function (queue) {
  var self = this;
  if (queue instanceof Queue) {
    this.queue = queue;
    this.queue.on('occupied', function () {
      self.checkQueue();
    });
  } else {
    throw new Error('Worker constructor expects a Queue');
  }
  this.checkQueue();
  return this;
};

Worker.prototype.checkQueue = function () {
  var self = this,
    job = this.queue.shift(),
    result,
    next = function () {
      process.nextTick(function () {
        self.checkQueue();
      });
    };

  if (!job) {
    return;
  }
  result = job.fn();
  if (Q.isPromise(result)) {
    result.done(function () {
      job.dfrd.resolve.apply(job.dfrd, arguments);
    });
  } else {
    job.dfrd.resolve(result);
    next();
  }
};

// exports

module.exports = Worker;
