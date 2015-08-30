'use strict';

var test = require('tap').test,
  parse = require('../../streams/parsers/javascript'),
  lint = require('../../streams/lint'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse(), lint()], 'lint.js', fn, callback);
}

test('lint - non-canonical type', function (t) {
  evaluate(function () {
    /**
     * @param {String} foo
     * @param {array} bar
     */
    return 0;
  }, function (result, errors) {
    t.equal(errors[0], 'lint.js:3: type String found, string is standard');
    t.equal(errors[1], 'lint.js:4: type array found, Array is standard');
    t.end();
  });
});
