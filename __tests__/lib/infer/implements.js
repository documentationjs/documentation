/*eslint-disable no-unused-vars*/
import inferImplements from '../../../src/infer/implements';
import parse from '../../../src/parsers/javascript';

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(code, filename) {
  return inferImplements(toComment(code, filename));
}

test('inferImplements (flow)', function () {
  expect(evaluate('/** */class A implements B {}').implements).toEqual([
    {
      name: 'B',
      title: 'implements'
    }
  ]);

  expect(evaluate('/** */class A implements B, C {}').implements).toEqual([
    {
      name: 'B',
      title: 'implements'
    },
    {
      name: 'C',
      title: 'implements'
    }
  ]);
});

test('inferImplements (typescript)', function () {
  expect(
    evaluate('/** */class A implements B {}', 'test.ts').implements
  ).toEqual([
    {
      name: 'B',
      title: 'implements'
    }
  ]);

  expect(
    evaluate('/** */class A implements B, C {}', 'test.ts').implements
  ).toEqual([
    {
      name: 'B',
      title: 'implements'
    },
    {
      name: 'C',
      title: 'implements'
    }
  ]);
});
