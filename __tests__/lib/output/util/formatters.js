var formatters = require('../../../../src/output/util/formatters')(getHref);

test('formatters.parameters -- long form', function() {
  expect(formatters.parameters({})).toEqual('()');
  expect(formatters.parameters({ params: [] })).toEqual('()');
  expect(formatters.parameters({ params: [{ name: 'foo' }] })).toEqual(
    '(foo: any)'
  );
  expect(
    formatters.parameters({
      params: [{ name: 'foo', type: { type: 'OptionalType' } }]
    })
  ).toEqual('(foo: any?)');
});

test('formatters.parameters -- short form', function() {
  expect(formatters.parameters({}, true)).toEqual('()');
  expect(formatters.parameters({ params: [] }, true)).toEqual('()');
  expect(formatters.parameters({ params: [{ name: 'foo' }] }, true)).toEqual(
    '(foo)'
  );
  expect(
    formatters.parameters(
      {
        params: [{ name: 'foo', type: { type: 'OptionalType' } }]
      },
      true
    )
  ).toEqual('(foo?)');
  expect(
    formatters.parameters(
      {
        params: [
          {
            title: 'param',
            description: 'param',
            type: {
              type: 'OptionalType',
              expression: {
                type: 'NameExpression',
                name: 'number'
              }
            },
            name: 'bar',
            default: '1'
          }
        ]
      },
      true
    )
  ).toEqual('(bar = 1)');
});

function getHref(x) {
  return x;
}
