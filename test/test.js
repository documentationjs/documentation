'use strict';

var test = require('tape'),
  documentation = require('../'),
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

glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
  test(path.basename(file), function (t) {
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
