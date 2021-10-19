/*eslint-disable no-unused-vars*/
import inferAugments from '../../../src/infer/augments';
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
  return inferAugments(toComment(code, filename));
}

test('inferAugments', function () {
  expect(evaluate('/** */class A extends B {}').augments).toEqual([
    {
      name: 'B',
      title: 'augments'
    }
  ]);

  expect(evaluate('/** */interface A extends B, C {}').augments).toEqual([
    {
      name: 'B',
      title: 'extends'
    },
    {
      name: 'C',
      title: 'extends'
    }
  ]);

  expect(
    evaluate('/** */interface A extends B, C {}', 'test.ts').augments
  ).toEqual([
    {
      name: 'B',
      title: 'extends'
    },
    {
      name: 'C',
      title: 'extends'
    }
  ]);
});
