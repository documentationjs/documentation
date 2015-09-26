'use strict';

var test = require('tape'),
  documentation = require('../'),
  markdown = require('../streams/output/markdown.js'),
  outputHtml = require('../streams/output/html.js'),
  glob = require('glob'),
  path = require('path'),
  fs = require('fs'),
  chdir = require('chdir');

var UPDATE = !!process.env.UPDATE;

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = path.relative(__dirname, item.context.file);
  });
  return result;
}

test('external modules option', function (t) {
  documentation([
    path.join(__dirname, 'fixture', 'external.input.js')
  ], {
    external: '(external|external/node_modules/*)'
  }, function (err, result) {
    t.ifError(err);
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_external-deps-included.json');
    if (UPDATE) {
      fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    }
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  });
});

test('parse', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file], null, function (err, result) {
        t.ifError(err);
        normalize(result);
        var outputfile = file.replace('.input.js', '.output.json');
        if (UPDATE) {
          fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
        }
        var expect = require(outputfile);
        t.deepEqual(result, expect);
        t.end();
      });
    });
  });
  tt.end();
});

test('formats', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test('json', function (ttt) {
      documentation([file], null, function (err, result) {
        ttt.ifError(err);
        normalize(result);
        var outputfile = file.replace('.input.js', '.output.json');
        var expect = require(outputfile);
        ttt.deepEqual(result, expect);
        ttt.end();
      });
    });
  });
  tt.end();
});

test('bad input', function (tt) {
  glob.sync(path.join(__dirname, 'fixture/bad', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file], null, function (error, res) {
        t.equal(res, undefined);
        delete error.stream;
        var outputfile = file.replace('.input.js', '.output.json');
        if (UPDATE) {
          fs.writeFileSync(outputfile, JSON.stringify(error, null, 2));
        }
        var expect = require(outputfile);
        t.deepEqual(error, expect);
        t.end();
      });
    });
  });
  tt.end();
});

/*
test('html', function (tt) {
  glob.sync(path.join(__dirname, 'fixture/html', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file])
        .pipe(outputHtml())
        .pipe(concat(function (result) {
        var clean = result.sort(function (a, b) {
          return a.path > b.path;
        }).filter(function (r) {
          return (!r.path.match(/json$/));
        }).map(function (r) {
          return r.contents;
        }).join('\n');
        var outputfile = file.replace('.input.js', '.output.files');
        if (UPDATE) {
          fs.writeFileSync(outputfile, clean, 'utf8');
        }
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.deepEqual(clean, expect);
        t.end();
      }));
    });
  });
  tt.end();
});


test('markdown', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file])
        .pipe(markdown())
        .pipe(concat(function (result) {
        var outputfile = file.replace('.input.js', '.output.md');
        if (UPDATE) {
          fs.writeFileSync(outputfile, result, 'utf8');
        }
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.equal(result.toString(), expect);
        t.end();
      }));
    });
    tt.test(path.basename(file) + ' custom', function (t) {
      documentation([file])
        .pipe(markdown({
          template: path.join(__dirname, '/misc/custom.hbs')
        }))
        .pipe(concat(function (result) {
        var outputfile = file.replace('.input.js', '.output.custom.md');
        if (UPDATE) {
          fs.writeFileSync(outputfile, result, 'utf8');
        }
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.equal(result.toString(), expect);
        t.end();
      }));
    });
  });
  tt.end();
});
*/

test('multi-file input', function (t) {
  documentation([
    path.join(__dirname, 'fixture', 'simple.input.js'),
    path.join(__dirname, 'fixture', 'simple-two.input.js')
  ], null, function (err, result) {
    t.ifError(err);
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_multi-file-input.json');
    if (UPDATE) {
      fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    }
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  });
});

test('accepts simple relative paths', function (t) {
  chdir(__dirname, function () {
    documentation('fixture/simple.input.js', null, function (err, data) {
      t.ifError(err);
      t.equal(data.length, 1, 'simple has no dependencies');
      t.end();
    });
  });
});
