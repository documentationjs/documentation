'use strict';

var path = require('path');
var os = require('os');
var got = require('got');
var getPort = require('get-port');
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

function wait(subprocess) {
  var cancelled = false;
  return new Promise((resolve, reject) => {
    subprocess.stdout.on('data', data => {
      cancelled = true;
      return resolve(data);
    });
    subprocess.stderr.pipe(process.stderr);
    subprocess.on('exit', code => {
      if (!cancelled) {
        reject(new Error('Process exited, code ' + code));
      }
    });
  });
}

describe('watch and serve', function () {

  it('harness', function () {
    return getPort().then(port => {
      var docprocess = documentation(['serve', 'fixture/simple.input.js', '--port', port]);
      expect(docprocess).toBeTruthy();
      docprocess.kill();
    });
  });

  it('provides index.html', function () {
    return getPort().then(port => {
      var docprocess = documentation(['serve', 'fixture/simple.input.js', '--port', port]);
      return wait(docprocess).then(function (data) {
        expect(data.toString().trim()).toBe(`documentation.js serving on port ${port}`);
        return got(`http://localhost:${port}/`).then(function (response) {
          expect(response.body.match(/<html>/)).toBeTruthy();
          docprocess.kill();
        });
      });
    });
  });

  it('accepts port argument', function () {
    return getPort().then(port => {
      var docprocess = documentation(['serve', 'fixture/simple.input.js', '--port', port]);
      return wait(docprocess).then(data => {
        return got(`http://localhost:${port}/`).then(function (response) {
          expect(response.body.match(/<html>/)).toBeTruthy();
          docprocess.kill();
        });
      });
    });
  });

  // it('--watch', function () {
  //   return getPort().then(port => {
  //     console.log('Chose port', port);
  //     var tmpfile = path.join(os.tmpdir(), '/simple.js');
  //     fs.writeFileSync(tmpfile, '/** a function */function apples() {}');
  //     var docprocess = documentation(['serve', tmpfile, '--port', port]);
  //     return wait(docprocess).then(data => {
  //       return got('http://localhost:4001/').then(function (text) {
  //         expect(text.match(/apples/)).toBeTruthy();
  //         fs.writeFileSync(tmpfile, '/** a function */function bananas() {}');
  //         function doget() {
  //           return got(`http://localhost:${port}/`).then(function (text) {
  //             if (text.match(/bananas/)) {
  //               docprocess.kill();
  //             } else {
  //               setTimeout(doget, 100);
  //             }
  //           });
  //         }
  //         doget();
  //       });
  //     });
  //   });
  // });

  it('required files', function () {
    return getPort().then(port => {
      var tmpdir = os.tmpdir();
      var a = path.join(tmpdir, '/simple.js');
      var b = path.join(tmpdir, '/required.js');
      fs.writeFileSync(a, 'require("./required")');
      fs.writeFileSync(b, '/** soup */function soup() {}');
      var docprocess = documentation(['serve', a, '--port', port]);
      return wait(docprocess).then(data => {
        return got(`http://localhost:${port}/`).then(function (response) {
          expect(response.body.match(/soup/)).toBeTruthy();
          fs.writeFileSync(b, '/** nuts */function nuts() {}');
          function doget() {
            got('http://localhost:4001/').then(function (response) {
              if (response.body.match(/nuts/)) {
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
  });

  it('error page', function () {
    return getPort().then(port => {
      var tmpdir = os.tmpdir();
      var a = path.join(tmpdir, '/simple.js');
      fs.writeFileSync(a, '**');
      var docprocess = documentation(['serve', a, '--port', port]);
      return wait(docprocess).then(data => {
        return got(`http://localhost:${port}/`).then(function (response) {
          expect(response.body.match(/Unexpected token/g)).toBeTruthy();
          docprocess.kill();
        });
      });
    });
  });
});
