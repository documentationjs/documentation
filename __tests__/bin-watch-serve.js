var path = require('path');
var os = require('os');
var get = require('./utils').get;
var spawn = require('child_process').spawn;
var fs = require('fs');
var pEvent = require('p-event');

function documentation(args, options) {
  if (!options) {
    options = {};
  }
  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;
  args.unshift(path.join(__dirname, '..', 'bin', 'documentation.js'));

  return spawn('node', args, options);
}

function normalize(result) {
  result.forEach(function(item) {
    item.context.file = '[path]';
  });
  return result;
}

const timeout = 20000;

test('harness', function() {
  var docProcess = documentation(['serve', 'fixture/simple.input.js']);
  expect(docProcess).toBeTruthy();
  docProcess.kill();
});

test(
  'provides index.html',
  function() {
    var docProcess = documentation(['serve', 'fixture/simple.input.js']);
    return pEvent(docProcess.stdout, 'data').then(function(data) {
      var portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function(text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);

test(
  'accepts port argument',
  function() {
    var docProcess = documentation([
      'serve',
      'fixture/simple.input.js',
      '--port=4004'
    ]);
    return pEvent(docProcess.stdout, 'data').then(function(data) {
      var portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function(text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);

test(
  '--watch',
  function(done) {
    var tmpFile = path.join(os.tmpdir(), '/simple.js');
    fs.writeFileSync(tmpFile, '/** a function */function apples() {}');
    var docProcess = documentation(['serve', tmpFile, '--watch']);
    pEvent(docProcess.stdout, 'data').then(function(data) {
      var portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function(text) {
        expect(text.match(/apples/)).toBeTruthy();
        fs.writeFileSync(tmpFile, '/** a function */function bananas() {}');
        function doGet() {
          get(`http://localhost:${portNumber[1]}/`).then(function(text) {
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

test(
  '--watch',
  function(done) {
    var tmpDir = os.tmpdir();
    var a = path.join(tmpDir, '/simple.js');
    var b = path.join(tmpDir, '/required.js');
    fs.writeFileSync(a, 'require("./required")');
    fs.writeFileSync(b, '/** soup */function soup() {}');
    var docProcess = documentation(['serve', a, '--watch']);
    docProcess.stdout.once('data', function(data) {
      var portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      get(`http://localhost:${portNumber[1]}/`).then(function(text) {
        expect(text.match(/soup/)).toBeTruthy();
        fs.writeFileSync(b, '/** nuts */function nuts() {}');
        function doGet() {
          get(`http://localhost:${portNumber[1]}/`).then(function(text) {
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

test(
  'error page',
  function() {
    var tmpDir = os.tmpdir();
    var a = path.join(tmpDir, '/simple.js');
    fs.writeFileSync(a, '**');
    var docProcess = documentation(['serve', a, '--watch']);
    return pEvent(docProcess.stdout, 'data').then(function(data) {
      var portNumber = data
        .toString()
        .match(/documentation.js serving on port (\d+)/);
      expect(portNumber).toBeTruthy();
      return get(`http://localhost:${portNumber[1]}/`).then(function(text) {
        expect(text.match(/Unexpected token/)).toBeTruthy();
        docProcess.kill();
      });
    });
  },
  timeout
);
