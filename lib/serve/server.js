'use strict';

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

// This file triggers https://github.com/prettier/prettier/issues/1151

var http = require('http');
var mime = require('mime');
var pify = require('pify');
var EventEmitter = require('events').EventEmitter;
var liveReload = require('tiny-lr');
var sep = require('path').sep;

/**
 * A static file server designed to support documentation.js's --serve
 * option. It serves from an array of Vinyl File objects (virtual files in
 * memory) and exposes a `setFiles` method that both replaces the set
 * of files and notifies any browsers using LiveReload to reload
 * and display the new content.
 * @class
 * @param port server port to serve on.
 */
var Server = (function(_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(port, disableLiveReload) {
    _classCallCheck(this, Server);

    var _this = _possibleConstructorReturn(
      this,
      (Server.__proto__ || Object.getPrototypeOf(Server)).call(this)
    );

    if (typeof port !== 'number') {
      throw new Error('port argument required to initialize a server');
    }
    _this._port = port;
    _this._files = [];
    _this._disableLiveReload = !!disableLiveReload;
    return _this;
  }

  /**
   * Update the set of files exposed by this server and notify LiveReload
   * clients
   *
   * @param files new content. replaces any previously-set content.
   * @returns {Server} self
   */

  _createClass(Server, [
    {
      key: 'setFiles',
      value: function setFiles(files) {
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
    },
    {
      key: 'handler',
      value: function handler(request, response) {
        var path = request.url.substring(1);
        if (path === '') {
          path = 'index.html';
        }

        for (var i = 0; i < this._files.length; i++) {
          var file = this._files[i];
          var filePath = file.relative.split(sep).join('/');
          if (filePath === path) {
            response.writeHead(200, { 'Content-Type': mime.getType(path) });
            response.end(file.contents);
            return;
          }
        }
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not found');
      }
    },
    {
      key: 'start',
      value: function start() {
        var _this2 = this;

        /*
         * Boot up the server's HTTP & LiveReload endpoints. This method
         * can be called multiple times.
         *
         * @returns {Promise} resolved when server starts
         */
        return new Promise(function(resolve) {
          // idempotent
          if (_this2._http) {
            return resolve(_this2);
          }

          if (!_this2._disableLiveReload) {
            _this2._lr = liveReload();
          }
          _this2._http = http.createServer(_this2.handler.bind(_this2));

          return Promise.all([
            _this2._lr && pify(_this2._lr.listen.bind(_this2._lr))(35729),
            pify(_this2._http.listen.bind(_this2._http))(_this2._port)
          ]).then(function() {
            _this2.emit('listening');
            return resolve(_this2);
          });
        });
      }
    },
    {
      key: 'stop',
      value: function stop() {
        var _this3 = this;

        /*
         * Shut down the server's HTTP & LiveReload endpoints. This method
         * can be called multiple times.
         */
        return Promise.all([
          this._http && this._http.close(),
          this._lr && this._lr.close()
        ]).then(function() {
          delete _this3._http;
          delete _this3._lr;
          return _this3;
        });
      }
    }
  ]);

  return Server;
})(EventEmitter);

module.exports = Server;
