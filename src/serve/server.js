// This file triggers https://github.com/prettier/prettier/issues/1151

const http = require('http');
const mime = require('mime');
const pify = require('pify');
const EventEmitter = require('events').EventEmitter;
const liveReload = require('tiny-lr');
const sep = require('path').sep;

/**
 * A static file server designed to support documentation.js's --serve
 * option. It serves from an array of Vinyl File objects (virtual files in
 * memory) and exposes a `setFiles` method that both replaces the set
 * of files and notifies any browsers using LiveReload to reload
 * and display the new content.
 * @class
 * @param port server port to serve on.
 */
class Server extends EventEmitter {
  constructor(port, disableLiveReload) {
    super();
    if (typeof port !== 'number') {
      throw new Error('port argument required to initialize a server');
    }
    this._port = port;
    this._files = [];
    this._disableLiveReload = !!disableLiveReload;
  }

  /**
   * Update the set of files exposed by this server and notify LiveReload
   * clients
   *
   * @param files new content. replaces any previously-set content.
   * @returns {Server} self
   */
  setFiles(files) {
    this._files = files;
    if (this._lr) {
      this._lr.changed({ body: { files: '*' } });
    }
    return this;
  }

  /**
   * Internal handler for server requests. The server serves
   * very few types of things: html, images, and so on, and it
   * only handles GET requests.
   *
   * @param {http.Request} request content wanted
   * @param {http.Response} response content returned
   * @returns {undefined} nothing
   * @private
   */
  handler(request, response) {
    let path = request.url.substring(1);
    if (path === '') {
      path = 'index.html';
    }

    for (let i = 0; i < this._files.length; i++) {
      const file = this._files[i];
      const filePath = file.relative.split(sep).join('/');
      if (filePath === path) {
        response.writeHead(200, { 'Content-Type': mime.getType(path) });
        response.end(file.contents);
        return;
      }
    }
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
  }

  start() {
    /*
     * Boot up the server's HTTP & LiveReload endpoints. This method
     * can be called multiple times.
     *
     * @returns {Promise} resolved when server starts
     */
    return new Promise(resolve => {
      // idempotent
      if (this._http) {
        return resolve(this);
      }

      if (!this._disableLiveReload) {
        this._lr = liveReload();
      }
      this._http = http.createServer(this.handler.bind(this));

      return Promise.all([
        this._lr && pify(this._lr.listen.bind(this._lr))(35729),
        pify(this._http.listen.bind(this._http))(this._port)
      ]).then(() => {
        this.emit('listening');
        return resolve(this);
      });
    });
  }

  stop() {
    /*
     * Shut down the server's HTTP & LiveReload endpoints. This method
     * can be called multiple times.
     */
    return Promise.all([
      this._http && this._http.close(),
      this._lr && this._lr.close()
    ]).then(() => {
      delete this._http;
      delete this._lr;
      return this;
    });
  }
}

module.exports = Server;
