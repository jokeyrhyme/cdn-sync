'use strict'

// Node.JS standard modules

var events = require('events')
var path = require('path')

// 3rd-party modules

var _ = require('underscore')

// custom modules

// this module

var Target = function (obj) {
  var badStrategies, CDN, self
  self = this

  if (typeof obj.type !== 'string' || !obj.type) {
    throw new Error('target CDN with no "type" string')
  }
  if (Target.TYPES.indexOf(obj.type) === -1) {
    throw new Error('unsupported CDN type: "' + obj.type + '"')
  }
  this.type = obj.type

  if (!Array.isArray(obj.strategy) || !obj.strategy) {
    throw new Error('target CDN with no "strategy" list')
  }
  badStrategies = _.difference(obj.strategy, Target.STRATEGIES)
  if (badStrategies.length) {
    throw new Error('unsupported strategy: ' + badStrategies)
  }
  if (obj.strategy.indexOf('clone') !== -1 &&
      obj.strategy.indexOf('gzip') !== -1) {
    throw new Error('unsupported strategy combination: clone, gzip')
  }
  this.strategy = obj.strategy

  try {
    CDN = require(path.join(__dirname, 'cdn', this.type))
    this.cdn = new CDN(obj.options)
  } catch (err) {
    throw new Error('CDN adapter error: ' + err)
  }

  if (this.type === 'aws') {
    this.label = this.cdn.cfg.Bucket
  }

  this.cdn.on('progress', function (action) {
    self.emit('progress', action)
  })

  return this
}

Target.prototype = Object.create(events.EventEmitter.prototype)

Target.TYPES = ['aws']
Target.STRATEGIES = ['clone', 'gzip', 'gzip-suffix']

Target.prototype.test = function () {
  return this.cdn.test()
}

// exports

module.exports = Target
