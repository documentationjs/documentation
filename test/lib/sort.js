'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort');

test('sort stream alphanumeric', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var banana = { context: { sortKey: 'c' }, name: 'bananas' };

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
