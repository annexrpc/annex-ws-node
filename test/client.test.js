/**
 * Module dependencies
 */

var annex = require('..');
var marshal = require('annex-marshal-msgpack-node');

var client = annex.Client('wss://durga-service.herokuapp.com/register', {marshal: marshal});

var service = ['prod', 'http://example.com', 0, 'users', 'list', [], 'binary'];

function reg() {
  client.call('services', 'register', service, function(err, res) {
    setTimeout(function() {
      client.call('services', 'unregister', service, function(err, res) {
        setTimeout(reg, 1000);
      });
    }, 1000);
  });
}

reg();
