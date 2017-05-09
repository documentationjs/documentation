/*eslint max-len: 0 */

var _formatType = require('../src/output/util/format_type'),
  LinkerStack = require('../src/output/util/linker_stack'),
  remark = require('remark'),
  parse = require('doctrine-temporary-fork').parse;

function stringify(children) {
  return remark().stringify({
    type: 'paragraph',
    children
  });
}

test('formatType', function() {
  var linkerStack = new LinkerStack({});
  var formatType = _formatType.bind(undefined, linkerStack.link);
  [
    ['Foo', 'Foo'],
    ['null', 'null'],
    ['null', 'null'],
    ['*', 'any'],
    ['namedType.typeProperty', 'namedType.typeProperty'],
    [
      'Array|undefined',
      '([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) \\| [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined))'
    ],
    [
      'Array<number>',
      '[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>'
    ],
    [
      'number!',
      '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)!'
    ],
    ["('pre'|'post')", '(`"pre"` \\| `"post"`)'],
    ["'pre'|'post'", '(`"pre"` \\| `"post"`)'],
    [
      'function(string, boolean)',
      'function ([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean))'
    ],
    [
      'function(string, boolean): number',
      'function ([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)): [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)'
    ],
    ['function()', 'function ()'],
    [
      'function(this:something, string)',
      'function (this: something, [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))'
    ],
    ['function(new:something)', 'function (new: something)'],
    [
      '{myNum: number, myObject}',
      '{myNum: [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number), myObject}'
    ],
    [
      '[string,]',
      '\\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]'
    ],
    [
      'number?',
      '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?'
    ],
    [
      'number',
      '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)'
    ],
    ['?', '?'],
    ['void', 'void'],
    ['function(a:b)', 'function (a: b)'],
    ['function(a):void', 'function (a): void'],
    [
      'number=',
      '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?'
    ],
    [
      '...number',
      '...[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)'
    ],
    [
      'undefined',
      '[undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)'
    ]
  ].forEach(function(example) {
    expect(
      stringify(
        formatType(
          parse('@param {' + example[0] + '} a', { sloppy: true }).tags[0].type
        )
      )
    ).toEqual(example[1]);
  });

  expect(
    stringify(
      formatType(parse('@param {number} [a=1]', { sloppy: true }).tags[0].type)
    )
  ).toEqual(
    '[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?'
  );

  expect(
    stringify(
      _formatType(
        function(str) {
          return str.toUpperCase();
        },
        parse('@param {Foo} a', {
          sloppy: true
        }).tags[0].type
      )
    )
  ).toEqual('[Foo](FOO)');

  expect(stringify(formatType())).toEqual('any');

  expect(function() {
    formatType({});
  }).toThrow();
});
