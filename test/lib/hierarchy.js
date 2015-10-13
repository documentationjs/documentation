'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  hierarchy = require('../../lib/hierarchy');

function toComments(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function evaluate(fn, callback) {
  return hierarchy(toComments(fn, callback));
}

test('hierarchy', function (t) {
  var result = evaluate(function () {
    /**
     * @name Class
     * @class
     */

    /**
     * @name getFoo
     * @memberof Class
     * @instance
     */

    /**
     * @name isClass
     * @memberof Class
     * @static
     */

    /**
     * @name MAGIC_NUMBER
     * @memberof Class
     */

    /**
     * @name event
     * @memberof Class
     * @kind event
     * @instance
     */
  });

  t.equal(result.length, 1);

  t.equal(result[0].members.static.length, 2);
  t.deepEqual(result[0].members.static[0].path, ['Class', 'isClass']);

  t.equal(result[0].members.instance.length, 2);
  t.deepEqual(result[0].members.instance[0].path, ['Class', 'getFoo']);
  t.deepEqual(result[0].members.instance[1].path, ['Class', 'event']);

  t.end();
});

test('hierarchy - missing memberof', function (t) {
  var result = evaluate(function () {
    /**
     * Get foo
     * @memberof DoesNotExist
     * @returns {Number} foo
     */
  });

  t.equal(result.length, 1);
  t.deepEqual(result[0].errors[0], {
    message: 'memberof reference to DoesNotExist not found',
    commentLineNumber: 2
  }, 'correct error message');
  t.end();
});
