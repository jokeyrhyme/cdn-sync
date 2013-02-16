// Node.JS standard modules

var events = require('events');

// 3rd-party modules

var Q = require('q');

// custom modules

// promise-bound anti-callbacks

// this module

var Queue = function() {
  this.jobs = [];
  events.EventEmitter.call(this);
  return this;
};

Queue.prototype = Object.create(events.EventEmitter.prototype);

/**
 * @param {Function} job that needs to be queued.
 */
Queue.prototype.push = function(job) {
  var self = this;
  if (typeof job === 'function') {
    this.jobs.push(job);
  }
  if (this.jobs.length) {
    process.nextTick(function() {
      self.emit('occupied');
    });
  }
};

Queue.prototype.shift = function() {
  var self = this,
      job = this.jobs.shift();
  if (this.jobs.length) {
    process.nextTick(function() {
      self.emit('occupied');
    });
  }
  return job;
};

// exports

module.exports = Queue;
