'use strict';

var test = require('prova'),
  through = require('through'),
  fs = require('fs'),
  parse = require('../../streams/parse'),
  pivot = require('../../streams/pivot'),
  inferName = require('../../streams/infer_name');


// ---- Begin test cases ----
/* eslint-disable */

// Each test case is a jsdoc comment plus some example code. The test expectation
// for each test case is that the jsdoc description is equal to the inferred name.

// ExpressionStatement (comment attached here)
//   AssignmentExpression
//     MemberExpression
//     Identifier
/** expressionStatement1 */
exports.expressionStatement1 = test;

// ExpressionStatement
//   AssignmentExpression
//     MemberExpression (comment attached here)
//     FunctionExpression
/** expressionStatement2 */
exports.expressionStatement2 = function () {};

exports = {
  // Property (comment attached here)
  //   Identifier
  //   FunctionExpression
  /** property1 */
  property1: test,

  // Property
  //   Identifier (comment attached here)
  //   FunctionExpression
  /** property2 */
  property2: function () {}
};

/** function1 */
function function1() {}

/** function2 */
var function2 = function () {};

/**
* explicitName
* @name explicitName
*/
function implicitName() {}

/* eslint-enable */
// ---- End test cases ----


function check(comment) {
  var expected = comment.description,
    actual = comment.tags.name && comment.tags.name[ 0 ].name;

  test('inferName - ' + expected, function (t) {
    t.equal(actual, expected);
    t.end();
  });
}

var stream = parse();

stream
  .pipe(inferName())
  .pipe(pivot())
  .pipe(through(check));

stream.end({
  file: __filename,
  source: fs.readFileSync(__filename, 'utf8')
});
