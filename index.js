// Node.JS standard modules

var fs = require('fs'),
    path = require('path');

// 3rd-party modules

// custom modules

// this module

var config = require(path.join(__dirname, 'libs', 'config'));

// TODO: scan all visible files in directory to be synchronised

  // TODO: populate array of CDNFiles

// TODO: create worker threads

  // TODO: worker asks main thread for a CDNFile

  // TODO: worker uses CDN to process CDNFile

  // TODO: worker cleans up and then asks for next CDNFile

// TODO: use CDN to trigger post-sync clean-up (e.g. invalidation)
