/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Underscore.JS and __dirname
'use strict';
// Node.JS standard modules

var events = require('events');

// 3rd-party modules

var _ = require('underscore'),
  Q = require('q');

// custom modules

// promise-bound anti-callbacks

// this module

var Job = function (fn) {
  this.fn = fn;
  this.dfrd = Q.defer();
  this.promise = this.dfrd.promise;
  return this;
};

var Queue = function () {
  this.jobs = [];
  events.EventEmitter.call(this);
  return this;
};

Queue.prototype = Object.create(events.EventEmitter.prototype);

Queue.prototype.pokeJobs = function () {
  var self = this;
  process.nextTick(function () {
    if (self.jobs.length) {
      self.emit('occupied');
    }
  });
};

/**
 * @param {Function} fn job that needs to be queued.
 */
Queue.prototype.push = function (fn) {
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

Queue.prototype.shift = function () {
  var self = this,
    job = this.jobs.shift();

  this.pokeJobs();
  return job;
};

/**
 * @param {Object} context the value of "this" to maintain.
 * @param {Function|String} method the function, or name of a method to run.
 * @returns {Function} a queue-wrapped version of that provided method.
 */
Queue.prototype.bind = function (context, method) {
  var self = this;

  if (typeof method === 'string') {
    method = context[method];
  }

  return function () {
    var args = _.toArray(arguments),
      job;

    job = self.push(function () {
      return method.apply(context, args);
    });
    return job.promise;
  };
};

// exports

module.exports = Queue;
