const path = require('path');
const os = require('os');
const get = require('./utils').get;
const spawn = require('child_process').spawn;
const fs = require('fs');
const pEvent = require('p-event');

function documentation(args, options) {
  if (!options) {
    options = {};
  }
  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;
  args.unshift(path.resolve(__dirname, '..', 'bin', 'documentation.js'));

  return spawn('node', args, options);
}

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = '[path]';
  });
  return result;
}

const timeout = 20000;

test.skip('harness', function () {
  const docProcess = documentation(['serve', 'fixture/simple.input.js']);
  expect(docProcess).toBeTruthy();
  docProcess.kill();
});

test.skip(
  'provides index.html',
  function () {
    const docProcess = documentation(['serve', 'fixture/simple.input.js']);
    return pEvent(docProcess.stdout, 'data').then(function (data) {
      const portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function (text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);

test.skip(
  'accepts port argument',
  function () {
    const docProcess = documentation([
      'serve',
      'fixture/simple.input.js',
      '--port=4004'
    ]);
    return pEvent(docProcess.stdout, 'data').then(function (data) {
      const portNumber = data
        .toString()
        .match(/documentation.js serving on port 4004/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:4004/`).then(function (text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);

test.skip(
  '--watch',
  function (done) {
    const tmpFile = path.join(os.tmpdir(), '/simple.js');
    fs.writeFileSync(tmpFile, '/** a function */function apples() {}');
    const docProcess = documentation(['serve', tmpFile, '--watch']);
    pEvent(docProcess.stdout, 'data').then(function (data) {
      const portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function (text) {
        expect(text.match(/apples/)).toBeTruthy();
        fs.writeFileSync(tmpFile, '/** a function */function bananas() {}');
        function doGet() {
          get(`http://localhost:${portNumber[1]}/`).then(function (text) {
            if (text.match(/bananas/)) {
              docProcess.kill();
              done();
            } else {
              setTimeout(doGet, 100);
            }
          });
        }
        doGet();
      });
    });
  },
  timeout
);

test.skip(
  '--watch',
  function (done) {
    const tmpDir = os.tmpdir();
    const a = path.join(tmpDir, '/simple.js');
    const b = path.join(tmpDir, '/required.js');
    fs.writeFileSync(a, 'require("./required")');
    fs.writeFileSync(b, '/** soup */function soup() {}');
    const docProcess = documentation(['serve', a, '--watch']);
    docProcess.stdout.once('data', function (data) {
      const portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      get(`http://localhost:${portNumber[1]}/`).then(function (text) {
        expect(text.match(/soup/)).toBeTruthy();
        fs.writeFileSync(b, '/** nuts */function nuts() {}');
        function doGet() {
          get(`http://localhost:${portNumber[1]}/`).then(function (text) {
            if (text.match(/nuts/)) {
              docProcess.kill();
              done();
            } else {
              setTimeout(doGet, 100);
            }
          });
        }
        doGet();
      });
    });
  },
  timeout
);

test.skip(
  'error page',
  function () {
    const tmpDir = os.tmpdir();
    const a = path.join(tmpDir, '/simple.js');
    fs.writeFileSync(a, '**');
    const docProcess = documentation(['serve', a, '--watch']);
    return pEvent(docProcess.stdout, 'data').then(function (data) {
      const portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function (text) {
        expect(text.match(/Unexpected token/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);
