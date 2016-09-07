'use strict';

var test = require('tap').test,
  path = require('path'),
  os = require('os'),
  get = require('./utils').get,
  spawn = require('child_process').spawn,
  fs = require('fs');

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

test('harness', options, function (t) {
  var docProcess = documentation(['fixture/simple.input.js', '--serve']);
  t.ok(docProcess, 'creates a subprocess object');
  docProcess.kill();
  t.end();
});

test('provides index.html', options, function (t) {
  var docProcess = documentation(['serve', 'fixture/simple.input.js']);
  docProcess.stdout.on('data', function (data) {
    t.equal(data.toString().trim(), 'documentation.js serving on port 4001', 'shows listening message');
    get('http://localhost:4001/', function (text) {
      t.ok(text.match(/<html>/), 'sends an html index file');
      docProcess.kill();
      t.end();
    });
  });
});

test('accepts port argument', options, function (t) {
  var docProcess = documentation(['serve', 'fixture/simple.input.js', '--port=4004']);
  docProcess.stdout.on('data', function (data) {
    t.equal(data.toString().trim(), 'documentation.js serving on port 4004', 'shows listening message');
    get('http://localhost:4004/', function (text) {
      t.ok(text.match(/<html>/), 'sends an html index file');
      docProcess.kill();
      t.end();
    });
  });
});

test('--watch', options, function (t) {
  var tmpFile = path.join(os.tmpdir(), '/simple.js');
  fs.writeFileSync(tmpFile, '/** a function */function apples() {}');
  var docProcess = documentation(['serve', tmpFile, '--watch']);
  docProcess.stdout.on('data', function (data) {
    get('http://localhost:4001/', function (text) {
      t.ok(text.match(/apples/), 'sends an html index file');
      fs.writeFileSync(tmpFile, '/** a function */function bananas() {}');
      function doGet() {
        get('http://localhost:4001/', function (text) {
          if (text.match(/bananas/)) {
            docProcess.kill();
            t.end();
          } else {
            setTimeout(doGet, 100);
          }
        });
      }
      doGet();
    });
  });
});

test('--watch', options, function (t) {
  var tmpDir = os.tmpdir();
  var a = path.join(tmpDir, '/simple.js');
  var b = path.join(tmpDir, '/required.js');
  fs.writeFileSync(a, 'require("./required")');
  fs.writeFileSync(b, '/** soup */function soup() {}');
  var docProcess = documentation(['serve', a, '--watch']);
  docProcess.stdout.on('data', function (data) {
    get('http://localhost:4001/', function (text) {
      t.ok(text.match(/soup/), 'sends an html index file');
      fs.writeFileSync(b, '/** nuts */function nuts() {}');
      function doGet() {
        get('http://localhost:4001/', function (text) {
          if (text.match(/nuts/)) {
            docProcess.kill();
            t.end();
          } else {
            setTimeout(doGet, 100);
          }
        });
      }
      doGet();
    });
  });
});

test('error page', options, function (t) {
  var tmpDir = os.tmpdir();
  var a = path.join(tmpDir, '/simple.js');
  fs.writeFileSync(a, '**');
  var docProcess = documentation(['serve', a, '--watch']);
  docProcess.stdout.on('data', function (data) {
    get('http://localhost:4001/', function (text) {
      t.ok(text.match(/Unexpected token/), 'emits an error page');
      docProcess.kill();
      t.end();
    });
  });
});
