var parse = require('../../../src/parsers/javascript'),
  inferName = require('../../../src/infer/name'),
  inferAccess = require('../../../src/infer/access');

function toComment(fn) {
  return parse(
    {
      source: '(' + fn.toString() + ')'
    },
    {}
  )[0];
}

function evaluate(fn, re) {
  return inferAccess(re)(inferName(toComment(fn)));
}

test('inferAccess', function() {
  expect(
    evaluate(function() {
      /** Test */
      function _name() {}
    }, '^_').access
  ).toBe('private');

  expect(
    evaluate(function() {
      /** @private */
      function name() {}
    }, '^_').access
  ).toBe('private');

  expect(
    evaluate(function() {
      /** @public */
      function _name() {}
    }, '^_').access
  ).toBe('public');

  expect(
    evaluate(function() {
      /** Test */
      function name_() {}
    }, '_$').access
  ).toBe('private');
});
