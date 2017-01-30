'use strict';

var path = require('path');
var os = require('os');
var got = require('got');
var spawn = require('child_process').spawn;
var fs = require('fs');

function documentation(args, options, parsejson) {
  options = options || {};
  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxbuffer = 1024 * 1024;

  return spawn(
    path.join(__dirname, '../bin/documentation.js'),
    args,
    options);
}

function normalize(result) {
  result.foreach(function (item) {
    item.context.file = '[path]';
  });
  return result;
}

function wait(process) {
  return new Promise((resolve, reject) => {
    process.stdout.on('data', data => {
      return resolve(data);
    });
  });
}

describe('watch and serve', function () {
  it('harness', function () {
    var docprocess = documentation(['fixture/simple.input.js', '--serve']);
    expect(docprocess).toBeTruthy();
    docprocess.kill();
  });

  it('provides index.html', function () {
    var docprocess = documentation(['serve', 'fixture/simple.input.js']);
    return wait(docprocess).then(function (data) {
      expect(data.tostring().trim()).toBe('documentation.js serving on port 4001');
      return got('http://localhost:4001/').then(function (text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docprocess.kill();
      });
    });
  });

  it('accepts port argument', function () {
    var docprocess = documentation(['serve', 'fixture/simple.input.js', '--port=4004']);
    return wait(docprocess).then(data => {
      expect(data.tostring().trim()).toBe('documentation.js serving on port 4004');
      return got('http://localhost:4004/').then(function (text) {
        expect(text.match(/<html>/)).toBeTruthy();
        docprocess.kill();
      });
    });
  });

  it('--watch', function () {
    var tmpfile = path.join(os.tmpdir(), '/simple.js');
    fs.writeFileSync(tmpfile, '/** a function */function apples() {}');
    var docprocess = documentation(['serve', tmpfile, '--watch']);
    return wait(docprocess).then(data => {
      return got('http://localhost:4001/').then(function (text) {
        expect(text.match(/apples/)).toBeTruthy();
        fs.writeFileSync(tmpfile, '/** a function */function bananas() {}');
        function doget() {
          got('http://localhost:4001/').then(function (text) {
            if (text.match(/bananas/)) {
              docprocess.kill();
            } else {
              setTimeout(doget, 100);
            }
          });
        }
        doget();
      });
    });
  });

  it('--watch', function () {
    var tmpdir = os.tmpdir();
    var a = path.join(tmpdir, '/simple.js');
    var b = path.join(tmpdir, '/required.js');
    fs.writeFileSync(a, 'require("./required")');
    fs.writeFileSync(b, '/** soup */function soup() {}');
    var docprocess = documentation(['serve', a, '--watch']);
    return wait(docprocess).then(data => {
      return got('http://localhost:4001/').then(function (text) {
        expect(text.match(/soup/)).toBeTruthy();
        fs.writeFileSync(b, '/** nuts */function nuts() {}');
        function doget() {
          got('http://localhost:4001/').then(function (text) {
            if (text.match(/nuts/)) {
              docprocess.kill();
            } else {
              setTimeout(doget, 100);
            }
          });
        }
        doget();
      });
    });
  });

  it('error page', function () {
    var tmpdir = os.tmpdir();
    var a = path.join(tmpdir, '/simple.js');
    fs.writeFileSync(a, '**');
    var docprocess = documentation(['serve', a, '--watch']);
    return wait(docprocess).then(data => {
      return got('http://localhost:4001/').then(function (text) {
        expect(text.match(/unexpected token/)).toBeTruthy();
        docprocess.kill();
      });
    });
  });
});
