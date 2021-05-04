const get = require('../utils').get;
const File = require('vinyl');
const getPort = require('get-port');
const Server = require('../../src/serve/server');

const jsFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.js',
  contents: Buffer.from('var test = 123;')
});

const coffeeFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/file.coffee',
  contents: Buffer.from('test = 123')
});

const indexFile = new File({
  cwd: '/',
  base: '/test/',
  path: '/test/index.html',
  contents: Buffer.from('<html>')
});

test('server - throws on bad port', function () {
  expect(function () {
    const server = new Server('${port}');
  }).toThrow();
  expect(function () {
    const server = new Server();
  }).toThrow();
});

test('server', async function () {
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
  let text;

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
