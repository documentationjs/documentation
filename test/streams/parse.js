'use strict';

var test = require('tap').test,
  parse = require('../../streams/parsers/javascript'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse()], 'parse.js', fn, callback);
}

test('parse - unknown tag', function (t) {
  evaluate(function () {
    /** @unknown */
    return 0;
  }, function (result) {
    t.equal(result[0].tags[0].title, 'unknown');
    t.end();
  });
});

test('parse - error', function (t) {
  evaluate(function () {
    /** @param {foo */
    return 0;
  }, function (result, errors) {
    t.equal(errors[0], 'parse.js:2: Braces are not balanced');
    t.end();
  });
});
