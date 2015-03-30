'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  flatten = require('../../streams/flatten'),
  filterAccess = require('../../streams/filter_access'),
  inferName = require('../../streams/infer_name');

function evaluate(fn, callback, options) {
  var stream = parse();

  stream
    .pipe(inferName())
    .pipe(flatten())
    .pipe(filterAccess(options))
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
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
