'use strict';

var test = require('tap').test,
  _ = require('lodash'),
  parse = require('../../../lib/parsers/javascript'),
  inferMembership = require('../../../lib/infer/membership');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function evaluate(fn, callback) {
  return toComment(fn, callback).map(inferMembership);
}

function Foo() {}
function lend() {}

test('inferMembership - explicit', function (t) {
  t.deepEqual(_.pick(evaluate(function () {
    /**
     * Test
     * @memberof Bar
     * @static
     */
    Foo.bar = 0;
  })[0], ['memberof', 'scope']), {
    memberof: 'Bar',
    scope: 'static'
  }, 'explicit');

  t.deepEqual(_.pick(evaluate(function () {
    /** Test */
    Foo.bar = 0;
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'static'
  }, 'implicit');

  t.deepEqual(_.pick(evaluate(function () {
    /** Test */
    Foo.prototype.bar = 0;
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'instance'
  }, 'instance');

  t.deepEqual(_.pick(evaluate(function () {
    /** Test */
    Foo.bar.baz = 0;
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo.bar',
    scope: 'static'
  }, 'compound');

  t.deepEqual(_.pick(evaluate(function () {
    /** Test */
    (0).baz = 0;
  })[0], ['memberof', 'scope']), { }, 'unknown');

  t.deepEqual(_.pick(evaluate(function () {
    Foo.bar = {
      /** Test */
      baz: 0
    };
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo.bar',
    scope: 'static'
  }, 'static object assignment');

  t.deepEqual(_.pick(evaluate(function () {
    Foo.prototype = {
      /** Test */
      bar: 0
    };
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'instance'
  }, 'instance object assignment');

  t.deepEqual(_.pick(evaluate(function () {
    Foo.prototype = {
      /**
       * Test
       * @returns {undefined} bar
       */
      bar: function () {}
    };
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'instance'
  }, 'instance object assignment, function');

  t.deepEqual(_.pick(evaluate(function () {
    var Foo = {
      /** Test */
      baz: 0
    };
    return Foo;
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'static'
  }, 'variable object assignment');

  t.deepEqual(_.pick(evaluate(function () {
    var Foo = {
      /** Test
      * @returns {undefined} bar */
      baz: function () {}
    };
    return Foo;
  })[0], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'static'
  }, 'variable object assignment, function');

  t.deepEqual(_.pick(evaluate(function () {
    /** Test
    * @returns {undefined} bar */
    module.exports = function () {};
  })[0], ['memberof', 'scope']), {
    memberof: 'module',
    scope: 'static'
  }, 'simple');

  t.deepEqual(_.pick(evaluate(function () {
    lend(/** @lends Foo */{
      /** Test */
      bar: 0
    });
  })[1], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'static'
  }, 'lends, static');

  t.end();
});



test('inferMembership', function (t) {
  t.deepEqual(_.pick(evaluate(function () {
    lend(/** @lends Foo */{
      /**
       * Test
       * @returns {undefined} nothing
       */
      bar: function () {}
    });
  })[1], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'static'
  }, 'inferMembership - lends, static, function');

  t.deepEqual(_.pick(evaluate(function () {
    lend(/** @lends Foo.prototype */{
      /** Test */
      bar: 0
    });
  })[1], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'instance'
  });

  t.deepEqual(_.pick(evaluate(function () {
    lend(/** @lends Foo.prototype */{
      /**
       * Test
       * @returns {number} nothing
       */
      bar: function () {}
    });
  })[1], ['memberof', 'scope']), {
    memberof: 'Foo',
    scope: 'instance'
  }, 'inferMembership - lends, instance, function');

  t.equal(evaluate(function () {
    lend(/** @lends Foo */{});
    /** Test */
    return 0;
  })[0].memberof, undefined, 'inferMembership - lends applies only to following object');

  t.end();
});
