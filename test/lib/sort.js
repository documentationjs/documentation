'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort');

test('sort stream alphanumeric', function (t) {

  t.deepEqual([
    { name: 'apples' },
    { name: 'carrot' },
    { name: 'bananas' }].sort(sort.bind(undefined, null)),
  [
    { name: 'apples' },
    { name: 'bananas' },
    { name: 'carrot' }
  ], 'sort stream alphanumeric');

  t.deepEqual([{ name: 'apples' },
    { name: 'carrot' },
    { name: '2' },
    { name: '10' }].sort(sort.bind(undefined, ['apples', '2', 'carrot', '10'])),
  [
    { 'name': 'apples' },
    { 'name': '2' },
    { 'name': 'carrot' },
    { 'name': '10'}
  ], 'sort stream with explicit order for all');

  t.deepEqual([{ name: 'apples' },
    { name: 'carrot' },
    { name: '2' },
    { name: '10' }].sort(sort.bind(undefined, ['carrot', '10'])),
  [
    { 'name': 'carrot' },
    { 'name': '10'},
    { 'name': '2' },
    { 'name': 'apples' }
  ], 'sort stream with explicit order for some');

  t.deepEqual([
    { name: '10' },
    { name: '2' },
    { name: 'apples' },
    { name: 'carrot'}
  ].sort(sort.bind(undefined, null)),
    [{ name: '10' },
    { name: '2' },
    { name: 'apples' },
    { name: 'carrot' }], 'sort stream with numbers');

  t.end();
});
