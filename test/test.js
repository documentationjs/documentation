'use strict';

var test = require('prova'),
  documentation = require('../'),
  markdown = require('../streams/output/markdown.js'),
  flatten = require('../streams/flatten.js'),
  filterAccess = require('../streams/filter_access.js'),
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
}

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

test('markdown', function (tt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation([file])
        .pipe(flatten())
        .pipe((filterAccess()))
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
        .pipe(flatten())
        .pipe((filterAccess()))
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
