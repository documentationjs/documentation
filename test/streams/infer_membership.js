'use strict';

var test = require('prova'),
  parse = require('../../streams/parsers/javascript'),
  flatten = require('../../streams/flatten'),
  inferMembership = require('../../streams/infer/membership'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse(), inferMembership(), flatten()], 'infer_membership.js', fn, callback);
}

function Foo() {}
function lend() {}

test('inferMembership - explicit', function (t) {
  evaluate(function () {
    /**
     * Test
     * @memberof Bar
     * @static
     */
    Foo.bar = 0;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Bar');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - static', function (t) {
  evaluate(function () {
    /** Test */
    Foo.bar = 0;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - instance', function (t) {
  evaluate(function () {
    /** Test */
    Foo.prototype.bar = 0;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'instance');
    t.end();
  });
});

test('inferMembership - compound', function (t) {
  evaluate(function () {
    /** Test */
    Foo.bar.baz = 0;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo.bar');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - unknown', function (t) {
  evaluate(function () {
    /** Test */
    (0).baz = 0;
  }, function (result) {
    t.equal(result[ 0 ].memberof, undefined);
    t.equal(result[ 0 ].scope, undefined);
    t.end();
  });
});

test('inferMembership - static object assignment', function (t) {
  evaluate(function () {
    Foo.bar = {
      /** Test */
      baz: 0
    };
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo.bar');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - instance object assignment', function (t) {
  evaluate(function () {
    Foo.prototype = {
      /** Test */
      bar: 0
    };
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'instance');
    t.end();
  });
});

test('inferMembership - instance object assignment, function', function (t) {
  evaluate(function () {
    Foo.prototype = {
      /** Test */
      bar: function () {}
    };
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'instance');
    t.end();
  });
});

test('inferMembership - variable object assignment', function (t) {
  evaluate(function () {
    var Foo = {
      /** Test */
      baz: 0
    };
    return Foo;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - variable object assignment, function', function (t) {
  evaluate(function () {
    var Foo = {
      /** Test */
      baz: function () {}
    };
    return Foo;
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - simple', function (t) {
  evaluate(function () {
    /** Test */
    module.exports = function () {};
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'module');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - lends, static', function (t) {
  evaluate(function () {
    lend(/** @lends Foo */{
      /** Test */
      bar: 0
    });
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - lends, static, function', function (t) {
  evaluate(function () {
    lend(/** @lends Foo */{
      /** Test */
      bar: function () {}
    });
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'static');
    t.end();
  });
});

test('inferMembership - lends, instance', function (t) {
  evaluate(function () {
    lend(/** @lends Foo.prototype */{
      /** Test */
      bar: 0
    });
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'instance');
    t.end();
  });
});

test('inferMembership - lends, instance, function', function (t) {
  evaluate(function () {
    lend(/** @lends Foo.prototype */{
      /** Test */
      bar: function () {}
    });
  }, function (result) {
    t.equal(result[ 0 ].memberof, 'Foo');
    t.equal(result[ 0 ].scope, 'instance');
    t.end();
  });
});

test('inferMembership - lends applies only to following object', function (t) {
  evaluate(function () {
    lend(/** @lends Foo */{});
    /** Test */
    return 0;
  }, function (result) {
    t.equal(result.length, 1);
    t.equal(result[ 0 ].memberof, undefined);
    t.end();
  });
});
