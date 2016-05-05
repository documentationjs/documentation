'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort');

test('sort stream alphanumeric', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var banana = { context: { sortKey: 'c' }, name: 'bananas' };

  t.deepEqual(sort([
    apples, carrot, banana
  ]), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.deepEqual(sort([
    carrot, apples, banana
  ]), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.end();
});
