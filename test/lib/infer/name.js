'use strict';

var test = require('tap').test,
  parse = require('../../../streams/parsers/javascript'),
  inferName = require('../../../streams/infer/name'),
  helpers = require('../../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse(), inferName()], 'infer_name.js', fn, callback);
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
    t.equal(result[ 0 ].name, 'name');
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
    t.equal(result[ 0 ].name, 'name');
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
    t.equal(result[ 0 ].name, 'name');
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
    t.equal(result[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - function declaration', function (t) {
  evaluate(function () {
    /** Test */
    function name() {}
    return name;
  }, function (result) {
    t.equal(result[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - anonymous function expression', function (t) {
  evaluate(function () {
    /** Test */
    var name = function () {};
    return name;
  }, function (result) {
    t.equal(result[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - named function expression', function (t) {
  evaluate(function () {
    /** Test */
    var name = function name2() {};
    return name;
  }, function (result) {
    t.equal(result[ 0 ].name, 'name');
    t.end();
  });
});

test('inferName - explicit name', function (t) {
  evaluate(function () {
    /** @name explicitName */
    function implicitName() {}
    return implicitName;
  }, function (result) {
    t.equal(result[ 0 ].name, 'explicitName');
    t.end();
  });
});

test('inferName - class', function (t) {
  evaluate(function () {
    /** @class ExplicitClass */
    function ImplicitClass() {}
    return ImplicitClass;
  }, function (result) {
    t.equal(result[ 0 ].name, 'ExplicitClass');
    t.end();
  });
});

test('inferName - anonymous class', function (t) {
  evaluate(function () {
    /** @class */
    function ImplicitClass() {}
    return ImplicitClass;
  }, function (result) {
    t.equal(result[ 0 ].name, 'ImplicitClass');
    t.end();
  });
});

test('inferName - event', function (t) {
  evaluate(function () {
    /** @event explicitEvent */
    function implicitName() {}
    return implicitName;
  }, function (result) {
    t.equal(result[ 0 ].name, 'explicitEvent');
    t.end();
  });
});

test('inferName - typedef', function (t) {
  evaluate(function () {
    /** @typedef {Object} ExplicitTypedef */
    function implicitName() {}
    return implicitName;
  }, function (result) {
    t.equal(result[ 0 ].name, 'ExplicitTypedef');
    t.end();
  });
});

test('inferName - callback', function (t) {
  evaluate(function () {
    /** @callback explicitCallback */
    function implicitName() {}
    return implicitName;
  }, function (result) {
    t.equal(result[ 0 ].name, 'explicitCallback');
    t.end();
  });
});
