'use strict'
// Node.JS standard modules

var path = require('path')
var zlib = require('zlib')

// 3rd-party modules

var Q = require('q')

// custom modules

var bufferUtils = require(path.join(__dirname, 'bufferutils'))
var File = require(path.join(__dirname, 'file'))

// promise-bound anti-callbacks

// this module

/**
 * represents an individual Gzipped-file in the CDN, with required actions
 * @constructor
 */
var GzippedFile = function (file) {
  var self = this,
    dfrd = Q.defer()

  if (!(file instanceof File)) {
    throw new TypeError('GzippedFile constructor expects a File')
  }

  File.call(this, { path: file.path })
  this.file = file.clone()

  // a GzippedFile is virtual, so there is no direct link to localPath
  delete this.localPath

  this.promise = dfrd.promise

  this.file.promise.then(function (file) {
    self.setMIME(file.mime)
    return [
      self.getBuffer(),
      self.calculateMD5()
    ]
  }).spread(function (buffer) {
    // from the docs, I should not use buffer.length here
    // but it happens to match Content-Length from AWS perfectly ???
    // alternatives:
    // - buffer.toString().length
    // - Buffer.byteLength(buffer.toString())
    self.size = buffer.length
    process.nextTick(function () {
      dfrd.resolve(self)
    })
  })

  return this
}

GzippedFile.prototype = Object.create(File.prototype)

GzippedFile.prototype.constructor = GzippedFile

GzippedFile.prototype.setMIME = function (mime) {
  File.prototype.setMIME.call(this, mime)
  this.headers['Content-Encoding'] = 'gzip'
}

GzippedFile.prototype.createReadStream = function () {
  var gzip

  gzip = zlib.createGzip({
    level: 9,
    memLevel: 9
  })

  this.file.createReadStream().pipe(gzip)
  return gzip
}

GzippedFile.prototype.getBuffer = function () {
  var gzip
  gzip = this.createReadStream()

  return bufferUtils.fromStream(gzip)
}

// exports

module.exports = GzippedFile
