'use strict';

var test = require('tape'),
  documentation = require('../'),
  path = require('path'),
  concat = require('concat-stream'),
  chdir = require('chdir');

test('documentation', function (t) {
  documentation(path.join(__dirname, 'fixture/simple.js')).pipe(concat(function (data) {
    t.equal(data.length, 1, 'simple has no dependencies');
    t.end();
  }));
});

test('documentation - hashbang', function (t) {
  documentation(path.join(__dirname, 'fixture/simple-hashbang.js')).pipe(concat(function (data) {
    t.equal(data.length, 1, 'simple has no dependencies');
    t.end();
  }));
});

test('skips external dependencies', function (t) {
  documentation(path.join(__dirname, 'fixture/external.js')).pipe(concat(function (data) {
    t.equal(data.length, 0);
    t.end();
  }));
});

test('accepts simple relative paths', function (t) {
  chdir(__dirname, function () {
    documentation('fixture/simple.js').pipe(concat(function (data) {
      t.equal(data.length, 1, 'simple has no dependencies');
      t.end();
    }));
  });
});
