'use strict';

var test = require('tap').test,
  get = require('../utils').get,
  File = require('vinyl'),
  Server = require('../../lib/serve/server');

var jsFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.js',
  contents: new Buffer('var test = 123;')
});

var coffeeFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.coffee',
  contents: new Buffer('test = 123')
});

var indexFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/index.html',
  contents: new Buffer('<html>')
});

test('server - throws on bad port', function (t) {
  t.throws(function () {
    var server = new Server('4001');
  }, 'port must be a number');
  t.throws(function () {
    var server = new Server();
  }, 'port must be provided');
  t.end();
});

test('server', function (t) {
  var server = new Server(4001);
  t.ok(server, 'server is initialized');
  server.start(function () {

    t.test('start can be called more than once, without a callback', function (tt) {
      server.start();
      tt.end();
    });

    t.test('base path', function (tt) {
      get('http://localhost:4001/file.coffee', function (code) {
        tt.equal(code, 404, 'does not have a file, emits 404');
        tt.end();
      });
    });

    t.test('base path', function (tt) {
      server.setFiles([coffeeFile]);
      get('http://localhost:4001/file.coffee', function (text) {
        tt.equal(text, 'test = 123', 'emits response');
        tt.end();
      });
    });

    t.test('reset files', function (tt) {
      server.setFiles([coffeeFile, jsFile]);
      get('http://localhost:4001/file.js', function (text) {
        tt.equal(text, 'var test = 123;', 'emits response');
        tt.end();
      });
    });

    t.test('index.html special case', function (tt) {
      server.setFiles([coffeeFile, indexFile, jsFile]);
      get('http://localhost:4001/', function (text) {
        tt.equal(text, '<html>', 'sends index.html when / is requested');
        tt.end();
      });
    });

    t.test('cleanup', function (tt) {
      server.stop(function () {
        tt.end();
      });
    });

    t.test('stop can be called more than once, without a callback', function (tt) {
      server.stop();
      tt.end();
    });

    t.end();
  });
});
