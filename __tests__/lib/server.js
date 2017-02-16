'use strict';

var got = require('got');
var File = require('vinyl');
var Server = require('../../lib/serve/server');
var getPort = require('get-port');

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

it('server - throws on bad port', function () {
  expect(function () {
    var server = new Server('4001');
  }).toThrow();
  expect(function () {
    var server = new Server();
  }).toThrow();
});

describe('server', function () {
  it('boots up the server', function () {
    return getPort().then(port => {
      var server = new Server(port, {
        liveReload: false
      });
      expect(server).toBeTruthy();
      return server.start().then(function () {

        it('start can be called more than once, without a callback', function () {
          return server.start();
        });

        it('base path', function (done) {
          return got(`http://localhost:${port}/file.coffee`).then(function (code) {
            expect(code).toEqual(404);
          });
        });

        it('base path', function (done) {
          server.setFiles([coffeeFile]);
          return got(`http://localhost:${port}/file.coffee`).then(function (text) {
            expect(text).toEqual('test = 123');
          });
        });

        it('reset files', function (done) {
          server.setFiles([coffeeFile, jsFile]);
          return got(`http://localhost:${port}/file.js`).then(function (text) {
            expect(text).toEqual('var test = 123;');
          });
        });

        it('index.html special case', function (done) {
          server.setFiles([coffeeFile, indexFile, jsFile]);
          return got(`http://localhost:${port}/`).then(function (text) {
            expect(text).toEqual('<html>');
          });
        });

        it('cleanup', function (tt) {
          return server.stop();
        });

        it('stop can be called more than once, without a callback', function () {
          server.stop();
        });
      });
    });
  });
});
