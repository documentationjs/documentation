'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  pivot = require('../../streams/pivot'),
  inferName = require('../../streams/infer_name');

function evaluate(fn, callback) {
  var stream = parse();

  stream
    .pipe(inferName())
    .pipe(pivot())
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
}

test('inferName - expression statement', function (t) {
  evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test */
    exports.name = test;
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - expression statement, function', function (t) {
  evaluate(function () {
    // ExpressionStatement
    //   AssignmentExpression
    //     MemberExpression (comment attached here)
    //     FunctionExpression
    /** Test */
    exports.name = function () {};
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - property', function (t) {
  evaluate(function () {
    exports = {
      // Property (comment attached here)
      //   Identifier
      //   FunctionExpression
      /** Test */
      name: test
    };
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - property, function', function (t) {
  evaluate(function () {
    exports = {
      // Property
      //   Identifier (comment attached here)
      //   FunctionExpression
      /** Test */
      name: function () {}
    };
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - function declaration', function (t) {
  evaluate(function () {
    /** Test */
    function name() {}
    return name;
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - anonymous function expression', function (t) {
  evaluate(function () {
    /** Test */
    var name = function () {};
    return name;
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - named function expression', function (t) {
  evaluate(function () {
    /** Test */
    var name = function name2() {};
    return name;
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - explicit name', function (t) {
  evaluate(function () {
    /** @name explicitName */
    function implicitName() {}
    return implicitName;
  }, function (result) {
    t.equal(result[ 0 ].tags.name[ 0 ].name, 'explicitName');
    t.end();
  });
});
