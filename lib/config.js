'use strict'
// Node.JS standard modules

var path = require('path')

// 3rd-party modules

var Q = require('q')
var ZSchema = require('z-schema')

// custom modules

var Target = require(path.join(__dirname, 'target'))
var schema = require(path.join(__dirname, '..', 'doc', 'cdn-sync.schema.json'))

// this module

var Config = function (obj) {
  if (!obj || !obj.targets || !Array.isArray(obj.targets)) {
    throw new TypeError('#/targets: expecting an Array')
  }
  this.original = JSON.parse(JSON.stringify(obj))

  this.targets = obj.targets.map(function (t) {
    return new Target(t)
  })
  return this
}

Config.FILENAME = '.cdn-sync.json'

Config.validate = function (obj) {
  var validator, dfrd
  dfrd = Q.defer()

  validator = new ZSchema()
  validator.validate(obj, schema, function (err, valid) {
    if (!valid || err) {
      if (Array.isArray(err) && err.length) {
        dfrd.reject(err[0])
      } else {
        dfrd.reject(err)
      }
      return
    }
    dfrd.resolve()
  })
  return dfrd.promise
}

Config.prototype.validate = function () {
  return Config.validate(this.original)
}

Config.prototype.testTargets = function () {
  var tests = this.targets.map(function (t) {
    return t.test()
  })
  return Q.all(tests)
}

/**
 * factory to generate Config object from a file (assumed to exist)
 * @param path
 */
Config.fromFile = function (file) {
  var obj, config
  try {
    obj = require(file)
  } catch (err) {
    throw new Error('.cdn-sync.json in unexpected format')
  }
  config = new Config(obj)
  config.cwd = path.dirname(file)
  return config
}

// exports

module.exports = Config
