var test = require('tap').test;
var formatters = require('../../../../lib/output/util/formatters')(getHref);

test('formatters.parameters -- long form', function (t) {
  t.deepEqual(formatters.parameters({}), '()');
  t.deepEqual(formatters.parameters({ params: [] }), '()');
  t.deepEqual(formatters.parameters({ params: [{ name: 'foo' }] }), '(foo: any)');
  t.deepEqual(formatters.parameters({ params: [{ name: 'foo', type: { type: 'OptionalType' } }] }), '(foo: [any])');
  t.done();
});

test('formatters.parameters -- short form', function (t) {
  t.deepEqual(formatters.parameters({}, true), '()');
  t.deepEqual(formatters.parameters({ params: [] }, true), '()');
  t.deepEqual(formatters.parameters({ params: [{ name: 'foo' }] }, true), '(foo)');
  t.deepEqual(formatters.parameters({
    params: [{ name: 'foo', type: { type: 'OptionalType' } }]
  }, true), '([foo])');
  t.done();
});

function getHref(x) {
  return x;
}
