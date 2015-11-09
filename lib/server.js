var http = require('http'),
  mime = require('mime'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  liveReload = require('tiny-lr');

/**
 * A static file server designed to support documentation.js's --serve
 * option. It serves from an array of Vinyl File objects (virtual files in
 * memory) and exposes a `setFiles` method that both replaces the set
 * of files and notifies any browsers using LiveReload to reload
 * and display the new content.
 * @class
 */
function Server() {
  this._files = [];
}

util.inherits(Server, EventEmitter);

/**
 * Update the set of files exposed by this server and notify LiveReload
 * clients
 *
 * @param {Array<File>} files new content. replaces any previously-set content.
 * @returns {Server} self
 */
Server.prototype.setFiles = function (files) {
  this._files = files;
  if (this._lr) {
    this._lr.changed({ body: { files: '*' } });
  }
  return this;
};

Server.prototype.handler = function (request, response) {
  var path = request.url.substring(1);
  if (path === '') {
    path = 'index.html';
  }
  for (var i = 0; i < this._files.length; i++) {
    if (this._files[i].relative === path) {
      response.writeHead(200, { 'Content-Type': mime.lookup(path) });
      this._files[i].pipe(response);
      return;
    }
  }
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('Not found');
};

/**
 * Boot up the server's HTTP & LiveReload endpoints. This method
 * can be called multiple times.
 *
 * @param {Function} [callback=] called when server is started
 * @returns {undefined}
 */
Server.prototype.start = function (callback) {

  callback = callback || noop;

  // idempotent
  if (this._lr) {
    return callback();
  }

  this._lr = liveReload();
  this._http = http.createServer(this.handler.bind(this));

  this._lr.listen(35729, function () {
    this._http.listen(4001, function () {
      this.emit('listening');
      callback();
    }.bind(this));
  }.bind(this));
};

/**
 * Shut down the server's HTTP & LiveReload endpoints. This method
 * can be called multiple times.
 *
 * @param {Function} [callback=] called when server is closed
 * @returns {undefined}
 */
Server.prototype.stop = function (callback) {

  callback = callback || noop;

  // idempotent
  if (!this._lr) {
    return callback();
  }

  this._http.close(function () {
    this._lr.close();
    this._http = null;
    this._lr = null;
    callback();
  }.bind(this));
};

function noop() {}

module.exports = Server;
