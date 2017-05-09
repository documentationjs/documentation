var get = require('../utils').get;
var File = require('vinyl');
var getPort = require('get-port');
var Server = require('../../src/serve/server');

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

test('server - throws on bad port', function() {
  expect(function() {
    var server = new Server('${port}');
  }).toThrow();
  expect(function() {
    var server = new Server();
  }).toThrow();
});

test('server', async function() {
  const port = await getPort();
  const server = new Server(port, true);
  expect(server).toBeTruthy();
  await server.start();
  try {
    await get(`http://localhost:${port}/file.coffee`);
  } catch (code) {
    expect(code).toEqual(404);
  }

  server.setFiles([coffeeFile]);
  var text;

  text = await get(`http://localhost:${port}/file.coffee`);
  expect(text).toMatchSnapshot();
  server.setFiles([coffeeFile, jsFile]);
  text = await get(`http://localhost:${port}/file.js`);
  expect(text).toMatchSnapshot();
  server.setFiles([coffeeFile, indexFile, jsFile]);
  text = await get(`http://localhost:${port}/`);
  expect(text).toMatchSnapshot();
  await server.stop();
});
