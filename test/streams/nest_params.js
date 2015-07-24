'use strict';

var test = require('tap').test,
  parse = require('../../streams/parsers/javascript'),
  flatten = require('../../streams/flatten'),
  nestParams = require('../../streams/nest_params'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse(), flatten(), nestParams()], 'nest_params.js', fn, callback);
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

test('nestParams - missing parent', function (t) {
  evaluate(function () {
    /**
     * @param {string} foo.bar
     */
    return 0;
  }, function (result) {
    t.equal(result[0].params.length, 1);
    t.equal(result[0].params[0].name, 'foo.bar');
    t.end();
  });
});
