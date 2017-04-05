'use strict'
// Node.JS standard modules

var stream = require('stream')

// 3rd-party modules

var Q = require('q')

// custom modules

// promise-bound anti-callbacks

// this module

function fromStream (readable, callback) {
  var chunks, dfrd
  if (!readable || !(readable instanceof stream.Readable)) {
    throw new Error('expects a Readable Stream')
  }
  if (!callback || !(callback instanceof Function)) {
    callback = function () { }
  }
  chunks = []
  dfrd = Q.defer()
  readable.on('data', function (data) {
    if (!(data instanceof Buffer)) {
      /* eslint-disable node/no-deprecated-api */ // fallback for Node.js 4.x
      data = Buffer.from ? Buffer.from(data) : new Buffer(data)
      /* eslint-enable node/no-deprecated-api */
    }
    chunks.push(data)
  })
  readable.once('end', function () {
    var buffer = Buffer.concat(chunks)
    callback(null, buffer)
    dfrd.resolve(buffer)
  })
  readable.once('error', function (err) {
    readable.removeAllListeners('data').removeAllListeners('end')
    callback(err)
    dfrd.reject(err)
  })
  return dfrd.promise
}

// exports

module.exports = {
  fromStream: fromStream
}
