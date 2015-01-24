/**
 * Module dependencies
 */

var annex = require('..');
var marshal = require('annex-marshal-msgpack-node');

var client = module.exports = annex.Client('ws://localhost:3000', {marshal: marshal});

client.add = function() {
  client.call('math', 'add', Array.prototype.slice.call(arguments), function(err, res) {
    console.log(res);
  });
};

client.add(1,2,3,4);
