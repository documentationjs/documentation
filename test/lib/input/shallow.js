'use strict';

var test = require('tap').test,
  path = require('path'),
  shallow = require('../../../lib/input/shallow');

test('shallow deps', function (t) {
  shallow([path.resolve(path.join(__dirname, '../../fixture/es6.input.js'))], {}, function (err, deps) {
    t.ifError(err);
    t.equal(deps.length, 1);
    t.ok(deps[0], 'has path');
    t.end();
  });
});

test('shallow deps multi', function (t) {
  shallow([
    path.resolve(path.join(__dirname, '../../fixture/es6.input.js')),
    path.resolve(path.join(__dirname, '../../fixture/es6.output.json'))
  ], {}, function (err, deps) {
    t.ifError(err);
    t.equal(deps.length, 2);
    t.ok(deps[0], 'has path');
    t.end();
  });
});

test('shallow deps directory', function (t) {
  shallow([
    path.resolve(path.join(__dirname, '../../fixture/html'))
  ], {}, function (err, deps) {
    t.ifError(err);
    t.equal(deps.length, 1);
    t.ok(deps[0].match(/input.js/), 'is the input file');
    t.end();
  });
});

test('shallow deps not found', function (t) {
  t.throws(function () {
    shallow([
      'not-found-file'
    ], {});
  }, 'not found');
  t.end();
});

test('shallow deps literal', function (t) {
  var obj = {
    file: 'foo.js',
    source: '//bar'
  };
  shallow([
    obj
  ], {}, function (err, deps) {
    t.ifError(err);
    t.equal(deps[0], obj);
    t.end();
  });
});
