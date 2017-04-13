/* @flow */

// This file triggers https://github.com/prettier/prettier/issues/1151

'use strict';
var http = require('http'),
  mime = require('mime'),
  pify = require('pify'),
  EventEmitter = require('events').EventEmitter,
  liveReload = require('tiny-lr'),
  sep = require('path').sep;

/* ::
declare type ServerFile = {
  relative: string,
  contents: string
};
*/

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
  /* :: _lr: Object; */
  /* :: _port: number; */
  /* :: _files: Array<ServerFile>; */
  /* :: _http: http.Server; */

  constructor(port /*: number*/) {
    super();
    if (typeof port !== 'number') {
      throw new Error('port argument required to initialize a server');
    }
    this._port = port;
    this._files = [];
  }

  /**
   * Update the set of files exposed by this server and notify LiveReload
   * clients
   *
   * @param files new content. replaces any previously-set content.
   * @returns {Server} self
   */
  setFiles(files /*: Array<ServerFile> */) {
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
  handler(
    request /*: http.IncomingMessage */,
    response /*: http.ServerResponse */
  ) {
    var path = request.url.substring(1);
    if (path === '') {
      path = 'index.html';
    }

    for (var i = 0; i < this._files.length; i++) {
      var file = this._files[i];
      var filePath = file.relative.split(sep).join('/');
      if (filePath === path) {
        response.writeHead(200, { 'Content-Type': mime.lookup(path) });
        response.end(file.contents);
        return;
      }
    }
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
  }

  // prettier-ignore
  start()/*: Promise<boolean> */ {
    /*
     * Boot up the server's HTTP & LiveReload endpoints. This method
     * can be called multiple times.
     *
     * @returns {Promise} resolved when server starts
     */
    return new Promise(resolve => {
      // idempotent
      if (this._lr) {
        return resolve(true);
      }

      this._lr = liveReload();
      this._http = http.createServer(this.handler.bind(this));

      return Promise.all([
        pify(this._lr.listen.bind(this._lr))(35729),
        pify(this._http.listen.bind(this._http))(this._port)
      ]).then(() => {
        this.emit('listening');
        return resolve(true);
      });
    });
  }

  // prettier-ignore
  stop()/*: Promise<boolean> */ {
    /*
     * Shut down the server's HTTP & LiveReload endpoints. This method
     * can be called multiple times.
     */
    return new Promise(resolve => {
      // idempotent
      if (!this._lr) {
        return resolve(true);
      }

      this._http.close(() => {
        this._lr.close();
        delete this._http;
        delete this._lr;
        resolve(true);
      });
    });
  }
}

module.exports = Server;
