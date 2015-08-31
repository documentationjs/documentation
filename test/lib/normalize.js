'use strict';

var test = require('tap').test,
  normalize = require('../../lib/normalize');

test('normalizes tags', function (t) {
  t.deepEqual(normalize({ tags: [{ title: 'return' }]}), { tags: [{ title: 'returns' }]});
  t.deepEqual(normalize({ tags: [{ title: 'extends' }]}), { tags: [{ title: 'augments' }]});
  t.deepEqual(normalize({ tags: [{ title: 'name' }]}), { tags: [{ title: 'name' }]});
  t.end();
});
