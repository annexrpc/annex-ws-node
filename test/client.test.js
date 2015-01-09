/**
 * Module dependencies
 */

var annex = require('..');
var marshal = require('annex-marshal-msgpack-node');

var client = module.exports = annex.Client('wss://poe-math-service.herokuapp.com', {marshal: marshal});

client.add = function() {
  client.call('math', 'add', Array.prototype.slice.call(arguments), function(err, res) {
    console.log(res);
  });
};
