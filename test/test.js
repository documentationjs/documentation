'use strict';

var test = require('prova'),
  documentation = require('../'),
  markdown = require('../streams/output/markdown.js'),
  outputHtml = require('../streams/output/html.js'),
  glob = require('glob'),
  path = require('path'),
  concat = require('concat-stream'),
  fs = require('fs'),
  chdir = require('chdir');

var UPDATE = !!process.env.UPDATE;

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = path.relative(__dirname, item.context.file);
  });
  return result;
}

test.only('external modules option', function (t) {
  documentation([
    path.join(__dirname, 'fixture', 'external.input.js')
  ], {
    external: '(external|external/node_modules/*)'
  }).pipe(concat(function (result) {
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_external-deps-included.json');
    if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  }));
});

test('parse', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file]).pipe(concat(function (result) {
        normalize(result);
        var outputfile = file.replace('.input.js', '.output.json');
        if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
        var expect = require(outputfile);
        t.deepEqual(result, expect);
        t.end();
      }));
    });
  });
});

test('formats', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test('json', function (ttt) {
      documentation([file]).pipe(documentation.formats.json()).pipe(concat(function (str) {
        var result = JSON.parse(str);
        normalize(result);
        var outputfile = file.replace('.input.js', '.output.json');
        var expect = require(outputfile);
        ttt.deepEqual(result, expect);
        ttt.end();
      }));
    });
  });
});

test('bad input', function (tt) {
  glob.sync(path.join(__dirname, 'fixture/bad', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file])
        .on('data', function () {
          t.fail('bad input should not yield data');
        })
        .on('error', function (error) {
          var outputfile = file.replace('.input.js', '.output.json');
          if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(error, null, 2));
          var expect = require(outputfile);
          t.deepEqual(error, expect);
        })
        .on('end', function () {
          t.end();
        });
    });
  });
});

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
        if (UPDATE) fs.writeFileSync(outputfile, clean, 'utf8');
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.deepEqual(clean, expect);
        t.end();
      }));
    });
  });
});


test('markdown', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file])
        .pipe(markdown())
        .pipe(concat(function (result) {
        var outputfile = file.replace('.input.js', '.output.md');
        if (UPDATE) fs.writeFileSync(outputfile, result, 'utf8');
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
        if (UPDATE) fs.writeFileSync(outputfile, result, 'utf8');
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.equal(result.toString(), expect);
        t.end();
      }));
    });
  });
});


test('multi-file input', function (t) {
  documentation([
    path.join(__dirname, 'fixture', 'simple.input.js'),
    path.join(__dirname, 'fixture', 'simple-two.input.js')
  ]).pipe(concat(function (result) {
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_multi-file-input.json');
    if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  }));
});

test('accepts simple relative paths', function (t) {
  chdir(__dirname, function () {
    documentation('fixture/simple.input.js').pipe(concat(function (data) {
      t.equal(data.length, 1, 'simple has no dependencies');
      t.end();
    }));
  });
});
