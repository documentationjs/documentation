'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  flatten = require('../../streams/flatten'),
  nestParams = require('../../streams/nest_params');

function evaluate(fn, callback) {
  var stream = parse();

  stream
    .pipe(flatten())
    .pipe(nestParams())
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
}

test('nestParams - no params', function (t) {
  evaluate(function () {
    /**
     * @name foo
     */
    return 0;
  }, function (result) {
    t.equal(result[0].params, undefined);
    t.end();
  });
});

test('nestParams - no nesting', function (t) {
  evaluate(function () {
    /**
     * @param {Object} foo
     */
    return 0;
  }, function (result) {
    t.equal(result[0].params.length, 1);
    t.equal(result[0].params[0].name, 'foo');
    t.equal(result[0].params[0].properties, undefined);
    t.end();
  });
});

test('nestParams - basic', function (t) {
  evaluate(function () {
    /**
     * @param {Object} foo
     * @param {string} foo.bar
     * @param {string} foo.baz
     */
    return 0;
  }, function (result) {
    t.equal(result[0].params.length, 1);
    t.equal(result[0].params[0].name, 'foo');
    t.equal(result[0].params[0].properties.length, 2);
    t.equal(result[0].params[0].properties[0].name, 'foo.bar');
    t.equal(result[0].params[0].properties[1].name, 'foo.baz');
    t.end();
  });
});
