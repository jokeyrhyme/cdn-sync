// Node.JS standard modules

var events = require('events');

// 3rd-party modules

var Q = require('q');

// custom modules

// promise-bound anti-callbacks

// this module

var Job = function(fn) {
  this.fn = fn;
  this.dfrd = Q.defer();
  this.promise = this.dfrd.promise;
  return this;
};

var Queue = function() {
  this.jobs = [];
  events.EventEmitter.call(this);
  return this;
};

Queue.prototype = Object.create(events.EventEmitter.prototype);

Queue.prototype.pokeJobs = function() {
  var self = this;
  process.nextTick(function() {
    if (self.jobs.length) {
      self.emit('occupied');
    }
  });
};

/**
 * @param {Function} fn job that needs to be queued.
 */
Queue.prototype.push = function(fn) {
  var self = this,
      dfrd = Q.defer(),
      job;

  if (typeof fn === 'function') {
    job = new Job(fn);
    this.jobs.push(job);
  }
  this.pokeJobs();
  return job;
};

Queue.prototype.shift = function() {
  var self = this,
      job = this.jobs.shift();
  this.pokeJobs();
  return job;
};

// exports

module.exports = Queue;
