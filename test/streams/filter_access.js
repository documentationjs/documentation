'use strict';

var test = require('tap').test,
  parse = require('../../streams/parsers/javascript'),
  filterAccess = require('../../streams/filter_access'),
  inferName = require('../../streams/infer/name'),
  helpers = require('../helpers');

function evaluate(fn, callback, options) {
  helpers.evaluate([
    parse(),
    inferName(),
    filterAccess(options)
  ], 'filter_access.js', fn, callback);
}

test('filterAccess default', function (t) {
  evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test
     * @private
     */
    exports.name = test;
  }, function (result) {
    t.equal(result.length, 0);
    t.end();
  });
});

test('filterAccess public', function (t) {
  evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test
     * @public
     */
    exports.name = test;
  }, function (result) {
    t.equal(result.length, 1);
    t.end();
  });
});

test('filterAccess override', function (t) {
  evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test
     * @private
     */
    exports.name = test;
  }, function (result) {
    t.equal(result.length, 1);
    t.end();
  }, []);
});
