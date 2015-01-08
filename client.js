/**
 * Module dependencies
 */

var WebsocketClient = require('ws');

module.exports = Client;

function Client(url, opts) {
  if (!(this instanceof Client)) return new Client(url, opts);
  var ws = this.ws = new WebsocketClient(url);
  var self = this;
  self.isReady = false;
  var pending = self.pending = [];
  this.requests = {};

  this.marshal = opts.marshal;

  ws.on('open', function() {
    self.isReady = true;
    pending.forEach(function(req) {
      ws.send(req);
    });
  });

  ws.on('message', function(data) {
    self._handle(data);
  });

  this._id = 0;
}

Client.prototype.call = function(mod, fun, args, cb) {
  var id = this._id++;
  var req = this.marshal.encode('call', id, mod, fun, args);
  if (!this.isReady) this.pending.push(req);
  else this.ws.send(req);

  this.requests[id] = cb;

  return this;
};

Client.prototype._handle = function(data) {
  try {
    var res = this.marshal.decode(data);
  } catch (e) {
    return this._handleError(e);
  }

  var type = res[0];
  var id = res[1];

  if (type === 1) return this._handleError(res);

  var cb = this.requests[id];

  if (cb) cb(null, res[2]);

  delete this.requests[id];
};
