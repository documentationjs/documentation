const fs = require('fs');
const {
  commentToFlow,
  parseToAst
} = require('../../../src/parsers/parse_to_ast');

describe('flow comments', () => {
  const f = require.resolve('../../fixture/flow/comment-types');
  const src = fs.readFileSync(f, 'utf8');

  test('preserve line numbers', () => {
    const out = commentToFlow(src);
    const linesSrc = src.split(/\n/);
    const linesOut = out.split(/\n/);

    expect(linesOut).toHaveLength(linesSrc.length);
    expect(linesSrc[14]).toEqual(linesOut[14]);
  });

  test('valid js', () => {
    expect(() => parseToAst(src)).not.toThrowError();
  });
});
