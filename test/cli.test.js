/**
 * Module dependencies
 */

var annex = require('..');
var repl = require('repl');
var marshal = require('annex-marshal-msgpack-node');

var host = process.argv[2] || 'ws://localhost:3000';

var client = global.client = annex.Client(host, {marshal: marshal});

global.call = function(mod, method) {
  client.call(mod, method, Array.prototype.slice.call(arguments, 2), function(err, res) {
    if (err) return console.error('ERROR', err.stack || err);
    console.log('RES:\n', JSON.stringify(res, null, '  '));
  });
};

global.now = function() {
  return Math.floor(Date.now() / 1000);
}

repl.start({
  prompt: host + ' > '
});
