var fs = require('fs'),
  path = require('path'),
  remark = require('remark'),
  polyglot = require('../../../src/parsers/polyglot');

test('polyglot', function() {
  var file = path.resolve(
    path.join(__dirname, '../../fixture/polyglot/blend.cpp')
  );
  var result = polyglot({
    file,
    source: fs.readFileSync(file, 'utf8')
  });
  delete result[0].context.file;
  delete result[0].context.sortKey;
  expect(result).toEqual([
    {
      errors: [],
      augments: [],
      examples: [],
      properties: [],
      throws: [],
      todos: [],
      sees: [],
      context: {
        loc: { end: { column: 3, line: 40 }, start: { column: 1, line: 35 } }
      },
      description: remark().parse('This method moves a hex to a color'),
      loc: { end: { column: 3, line: 40 }, start: { column: 1, line: 35 } },
      name: 'hexToUInt32Color',
      params: [
        {
          lineNumber: 3,
          title: 'param',
          name: 'hex',
          type: {
            name: 'string',
            type: 'NameExpression'
          }
        }
      ],
      returns: [
        {
          title: 'returns',
          description: remark().parse('color'),
          type: {
            name: 'number',
            type: 'NameExpression'
          }
        }
      ],
      tags: [
        {
          description: null,
          lineNumber: 2,
          name: 'hexToUInt32Color',
          title: 'name'
        },
        {
          description: null,
          lineNumber: 3,
          name: 'hex',
          title: 'param',
          type: {
            name: 'string',
            type: 'NameExpression'
          }
        },
        {
          description: 'color',
          lineNumber: 4,
          title: 'returns',
          type: {
            name: 'number',
            type: 'NameExpression'
          }
        }
      ]
    }
  ]);
});
