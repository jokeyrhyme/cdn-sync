'use strict'
// Node.JS standard modules

var crypto = require('crypto')
var fs = require('graceful-fs')
var path = require('path')

// 3rd-party modules

var Q = require('q')
var mime = require('mime')
var mmm = require('mmmagic')
var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

// custom modules

// promise-bound anti-callbacks

var detectFile = Q.nbind(magic.detectFile, magic)

// this module

/**
 * represents an individual file in the CDN, with required actions
 * @constructor
 */
var File = function (options) {
  const self = this
  const dfrd = Q.defer()
  const promises = []

  options = options || {}

  this.localPath = options.localPath || ''
  this.path = options.path || ''
  this.mime = options.mime || ''
  this.md5 = options.md5 || ''
  this.size = options.size || 0
  this.headers = null // only those missing from destination
  this.promise = dfrd.promise

  if (options.headers) {
    this.headers = JSON.parse(JSON.stringify(options.headers))
  } else {
    this.headers = {}
  }

  if (this.localPath) {
    if (!this.size) {
      promises.push(this.detectSize())
    }
    if (!this.mime) {
      promises.push(this.detectMIME())
    }
    if (!this.md5) {
      promises.push(this.calculateMD5())
    }
  }

  Q.all(promises).then(function () {
    process.nextTick(function () {
      dfrd.resolve(self)
    })
  }).done()

  return this
}

File.prototype.constructor = File

File.prototype.clone = function () {
  var Constructor = this.constructor
  return new Constructor(this)
}

File.prototype.setMIME = function (value) {
  var filename, ext

  filename = path.basename(this.localPath || this.path)
  filename = filename.replace(/\.gz$/, '')

  if (value.indexOf('x-empty') !== -1) {
    this.mime = 'text/plain'
  }

  if (value === 'application/octet-stream' || value.indexOf('text/') === 0) {
    this.mime = mime.lookup(filename)
    ext = path.extname(filename)
    if (!ext || ext === '.') {
      this.mime = 'text/plain'
    }
  } else {
    this.mime = value
  }

  if (path.extname(filename) === '.cur') {
    // for some reason, these files get really wrong...
    this.mime = mime.lookup(filename)
  }

  this.headers['Content-Type'] = this.mime
}

File.prototype.detectMIME = function (buffer) {
  const self = this
  const dfrd = Q.defer()

  detectFile(buffer || this.localPath)
    .then(function (result) {
      self.setMIME(result)
      dfrd.resolve()
    }).fail(function (err) {
      dfrd.reject(err)
    }).done()

  return dfrd.promise
}

File.prototype.detectSize = function () {
  const self = this
  const dfrd = Q.defer()

  fs.stat(this.localPath, function (err, stat) {
    if (err) {
      dfrd.reject(err)
    } else {
      self.size = stat.size
      dfrd.resolve()
    }
  })

  return dfrd.promise
}

File.prototype.calculateMD5 = function () {
  const self = this
  const dfrd = Q.defer()
  const md5 = crypto.createHash('md5')

  let rs = this.createReadStream()
  rs.on('error', function (err) {
    dfrd.reject(err)
  })
  rs.on('data', function (data) {
    md5.update(data)
  })
  rs.once('end', function () {
    self.md5 = md5.digest('hex')
    dfrd.resolve()
  })
  return dfrd.promise
}

File.prototype.createReadStream = function () {
  if (!this.localPath) {
    throw new Error('File has no localPath')
  }
  return fs.createReadStream(this.localPath)
}

File.prototype.getBuffer = function () {
  var dfrd, self
  self = this
  dfrd = Q.defer()

  try {
    fs.readFile(this.localPath, function (err, data) {
      if (err) {
        dfrd.reject(err)
      } else if (data.length !== self.size) {
        dfrd.reject(new Error('file size mismatch, re-run'))
      } else {
        dfrd.resolve(data)
      }
    })
  } catch (err) {
    dfrd.reject(err)
  }

  return dfrd.promise
}

mime.define({
  'image/vnd.microsoft.icon': ['cur'],
  'text/x-sass': ['sass'],
  'text/x-scss': ['scss']
})

// exports

module.exports = File
