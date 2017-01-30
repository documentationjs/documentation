'use strict';

var path = require('path');
var os = require('os');
var got = require('got');
var spawn = require('child_process').spawn;
var fs = require('fs');

function documentation(args, options, callback, parseJSON) {
  if (!callback) {
    callback = options;
    options = {};
  }

  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;

  return spawn(
    path.join(__dirname, '../bin/documentation.js'),
    args,
    options);
}

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = '[path]';
  });
  return result;
}

var options = { timeout: 1000 * 120 };

it('harness', options, function () {
  var docProcess = documentation(['fixture/simple.input.js', '--serve']);
  expect(docProcess).toBeTruthy();
  docProcess.kill();
});

it('provides index.html', options, function (done) {
  var docProcess = documentation(['serve', 'fixture/simple.input.js']);
  docProcess.stdout.on('data', function (data) {
    expect(data.toString().trim()).toBe('documentation.js serving on port 4001');
    got('http://localhost:4001/').then(function (text) {
      expect(text.match(/<html>/)).toBeTruthy();
      docProcess.kill();
      done();
    });
  });
});

it('accepts port argument', options, function (done) {
  var docProcess = documentation(['serve', 'fixture/simple.input.js', '--port=4004']);
  docProcess.stdout.on('data', function (data) {
    expect(data.toString().trim()).toBe('documentation.js serving on port 4004');
    got('http://localhost:4004/').then(function (text) {
      expect(text.match(/<html>/)).toBeTruthy();
      docProcess.kill();
      done();
    });
  });
});

it('--watch', options, function (done) {
  var tmpFile = path.join(os.tmpdir(), '/simple.js');
  fs.writeFileSync(tmpFile, '/** a function */function apples() {}');
  var docProcess = documentation(['serve', tmpFile, '--watch']);
  docProcess.stdout.on('data', function (data) {
    got('http://localhost:4001/').then(function (text) {
      expect(text.match(/apples/)).toBeTruthy();
      fs.writeFileSync(tmpFile, '/** a function */function bananas() {}');
      function doGet() {
        got('http://localhost:4001/').then(function (text) {
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
});

it('--watch', options, function (done) {
  var tmpDir = os.tmpdir();
  var a = path.join(tmpDir, '/simple.js');
  var b = path.join(tmpDir, '/required.js');
  fs.writeFileSync(a, 'require("./required")');
  fs.writeFileSync(b, '/** soup */function soup() {}');
  var docProcess = documentation(['serve', a, '--watch']);
  docProcess.stdout.on('data', function (data) {
    got('http://localhost:4001/').then(function (text) {
      expect(text.match(/soup/)).toBeTruthy();
      fs.writeFileSync(b, '/** nuts */function nuts() {}');
      function doGet() {
        got('http://localhost:4001/').then(function (text) {
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
});

it('error page', options, function (done) {
  var tmpDir = os.tmpdir();
  var a = path.join(tmpDir, '/simple.js');
  fs.writeFileSync(a, '**');
  var docProcess = documentation(['serve', a, '--watch']);
  docProcess.stdout.on('data', function (data) {
    got('http://localhost:4001/').then(function (text) {
      expect(text.match(/Unexpected token/)).toBeTruthy();
      docProcess.kill();
      done();
    });
  });
});
