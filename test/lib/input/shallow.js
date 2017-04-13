'use strict';

var test = require('tap').test,
  path = require('path'),
  shallow = require('../../../lib/input/shallow');

test('shallow deps', function(t) {
  shallow(
    [path.resolve(path.join(__dirname, '../../fixture/es6.input.js'))],
    {}
  ).then(deps => {
    t.equal(deps.length, 1);
    t.ok(deps[0], 'has path');
    t.end();
  });
});

test('shallow deps multi', function(t) {
  shallow(
    [
      path.resolve(path.join(__dirname, '../../fixture/es6.input.js')),
      path.resolve(path.join(__dirname, '../../fixture/es6.output.json'))
    ],
    {}
  ).then(deps => {
    t.equal(deps.length, 2);
    t.ok(deps[0], 'has path');
    t.end();
  });
});

test('shallow deps directory', function(t) {
  shallow([path.resolve(path.join(__dirname, '../../fixture/html'))], {})
    .then(deps => {
      t.equal(deps.length, 1);
      t.ok(deps[0].file.match(/input.js/), 'is the input file');
      t.end();
    })
    .catch(err => {
      t.fail(err);
      t.end();
    });
});

test('throws on non-string or object input', function(t) {
  shallow([true], {}).catch(err => {
    t.equal(err.message, 'Indexes should be either strings or objects');
    t.end();
  });
});

test('shallow deps literal', function(t) {
  var obj = {
    file: 'foo.js',
    source: '//bar'
  };
  shallow([obj], {}).then(deps => {
    t.equal(deps[0], obj);
    t.end();
  });
});
