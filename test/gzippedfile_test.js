'use strict'

// Node.JS standard modules

var path = require('path')

// 3rd-party modules

var chai = require('chai')
var assert = require('chai').assert

// custom modules

var cdnSync = require(path.join(__dirname, '..', 'lib'))
var File = cdnSync.File
var GzippedFile = cdnSync.GzippedFile

// promise-bound anti-callbacks

// this module

chai.use(require('sinon-chai'))

suite('GzippedFile module', function () {
  test('requires without issue', function () {
    assert(GzippedFile instanceof Function, 'got GzippedFile constructor')
  })
})

suite('GzippedFile object: this file', function () {
  var file, gzip

  suiteSetup(function () {
    File = require('../lib/file')
    file = new File({
      localPath: __filename,
      path: path.basename(__filename)
    })
  })

  test('constructor passed File', function () {
    gzip = new GzippedFile(file)
    assert.instanceOf(gzip.file, File, 'File object available in GzippedFile')
  })

  test('ready for use', function (done) {
    gzip.promise.then(function (g) {
      assert(true, 'ready with no failures')
      assert.isTrue(gzip.file.promise.isFulfilled(), 'real file ready!')
      assert.equal(gzip, g, 'returned self when ready')
      done()
    }).done()
  })

  test('path set', function () {
    assert.equal(gzip.path, path.basename(__filename), 'path set')
  })

  test('MIME set', function () {
    assert.equal(gzip.mime, 'application/javascript', 'MIME set')
  })

  test('MD5 set', function () {
    assert(gzip.md5, 'MD5 set')
  })

  test('size set', function () {
    assert.isNumber(gzip.size, 'size set')
    assert(gzip.size > 0, 'size > 0')
    assert(gzip.size <= file.size, 'size <= original size')
  })
})
