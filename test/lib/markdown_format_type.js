'use strict';

var formatType = require('../../streams/output/lib/markdown_format_type.js'),
  test = require('tap').test;

test('formatType', function (t) {
  t.deepEqual(formatType(), '', 'null case');
  t.deepEqual(formatType({
    type: 'NameExpression',
    name: 'Foo'
  }), 'Foo', 'name expression');

  t.deepEqual(formatType({
    type: 'UnionType',
    elements: [{
      type: 'NameExpression',
      name: 'Foo'
    }, {
      type: 'NameExpression',
      name: 'Bar'
    }]
  }), 'Foo or Bar', 'union expression');

  t.deepEqual(formatType({
    type: 'OptionalType',
    expression: {
      type: 'NameExpression',
      name: 'Foo'
    }
  }), '[Foo]', 'optional type');

  t.deepEqual(formatType({
    type: 'AllLiteral'
  }), 'Any', 'all literal');

  t.end();
});
