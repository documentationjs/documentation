'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort');

test('sort stream alphanumeric', function (t) {
  var apples = { context: { filename: 'a.txt', loc: { start: { line: 0 } } }, name: 'apples' };
  var carrot = { context: { filename: 'a.txt', loc: { start: { line: 1 } } }, name: 'carrot' };
  var banana = { context: { filename: 'a.txt', loc: { start: { line: 2 } } }, name: 'bananas' };

  t.deepEqual([
    apples, carrot, banana
  ].sort(sort.bind(undefined, null)), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.deepEqual([
    carrot, apples, banana
  ].sort(sort.bind(undefined, null)), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.end();
});
