/*eslint max-len: 0 */

import _formatType from '../src/output/util/format_type.js';
import LinkerStack from '../src/output/util/linker_stack';
import { remark } from 'remark';
import doctrine from 'doctrine-temporary-fork';
const parse = doctrine.parse;

function stringify(children) {
  return remark().stringify({
    type: 'paragraph',
    children
  });
}

test('formatType', function () {
  const linkerStack = new LinkerStack({});
  const formatType = _formatType.bind(undefined, linkerStack.link);
  [
    ['Foo', 'Foo'],
    ['null', 'null'],
    ['null', 'null'],
    ['*', 'any'],
    ['namedType.typeProperty', 'namedType.typeProperty'],
    [
      'Array|undefined',
      '([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Array) | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/undefined))'
    ],
    [
      'Array<number>',
      '[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Array)<[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)>'
    ],
    [
      'number!',
      '[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)!'
    ],
    ["('pre'|'post')", '(`"pre"` | `"post"`)'],
    ["'pre'|'post'", '(`"pre"` | `"post"`)'],
    [
      'function(string, boolean)',
      'function ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/String), [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Boolean))'
    ],
    [
      'function(string, boolean): number',
      'function ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/String), [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Boolean)): [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)'
    ],
    ['function()', 'function ()'],
    [
      'function(this:something, string)',
      'function (this: something, [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/String))'
    ],
    ['function(new:something)', 'function (new: something)'],
    [
      '{myNum: number, myObject}',
      '{myNum: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number), myObject}'
    ],
    [
      '[string,]',
      '\\[[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/String)]'
    ],
    [
      'number?',
      '[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)?'
    ],
    [
      'number',
      '[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)'
    ],
    ['?', '?'],
    ['void', 'void'],
    ['function(a:b)', 'function (a: b)'],
    ['function(a):void', 'function (a): void'],
    [
      'number=',
      '[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)?'
    ],
    [
      '...number',
      '...[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)'
    ],
    [
      'undefined',
      '[undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/undefined)'
    ]
  ].forEach(function (example) {
    expect(
      stringify(
        formatType(
          parse('@param {' + example[0] + '} a', { sloppy: true }).tags[0].type
        )
      )
    ).toEqual(example[1] + '\n');
  });

  expect(
    stringify(
      formatType(parse('@param {number} [a=1]', { sloppy: true }).tags[0].type)
    )
  ).toEqual(
    '[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global\\_Objects/Number)?\n'
  );

  expect(
    stringify(
      _formatType(
        function (str) {
          return str.toUpperCase();
        },
        parse('@param {Foo} a', {
          sloppy: true
        }).tags[0].type
      )
    )
  ).toEqual('[Foo](FOO)\n');

  expect(stringify(formatType())).toEqual('any\n');

  expect(function () {
    formatType({});
  }).toThrow();
});
