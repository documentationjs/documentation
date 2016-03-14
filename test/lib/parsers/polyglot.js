'use strict';

var test = require('tap').test,
  fs = require('fs'),
  path = require('path'),
  remark = require('remark'),
  polyglot = require('../../../lib/parsers/polyglot');

test('polyglot', function (t) {
  var file = path.resolve(path.join(__dirname, '../../fixture/polyglot/blend.cpp'));
  var result = polyglot({
    file: file,
    source: fs.readFileSync(file, 'utf8')
  });
  delete result[0].context.file;
  t.deepEqual(result, [{
    errors: [],
    context: {
      loc: { end: { column: 3, line: 40 }, start: { column: 1, line: 35 } } },
    description: remark.parse('This method moves a hex to a color'),
    loc: { end: { column: 3, line: 40 }, start: { column: 1, line: 35 } },
    name: 'hexToUInt32Color', params: [
      { lineNumber: 3, name: 'hex', type: { name: 'string', type: 'NameExpression' } } ],
    returns: [
      {
        description: remark.parse('color'),
        type: { name: 'number', type: 'NameExpression' } } ],
    tags: [ { description: null, lineNumber: 2, name: 'hexToUInt32Color', title: 'name' },
      { description: null, lineNumber: 3, name: 'hex', title: 'param', type: {
        name: 'string', type: 'NameExpression'
      } },
      { description: 'color', lineNumber: 4, title: 'returns', type: {
        name: 'number', type: 'NameExpression'
      } } ] } ], 'polyglot parser');
  t.end();
});
