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

  t.deepEqual([
    { name: '10' },
    { name: '2' },
    { name: 'apples' },
    { name: 'carrot'}
  ].sort(sort.bind(undefined, null)),
    [{ name: 'apples' },
    { name: 'carrot' },
    { name: '2' },
    { name: '10' }], 'sort stream with numbers');

  t.end();
});

/*
test('sort stream with explicit order for all', function (t) {
    .pipe(sort(['apples', '2', 'carrot', '10']))
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (docs) {
      t.deepEqual(docs, [
        { 'name': 'apples' },
        { 'name': '2' },
        { 'name': 'carrot' },
        { 'name': '10'}
      ]);
      t.end();
    }));

  input.write({ name: 'apples' });
  input.write({ name: 'carrot' });
  input.write({ name: '2' });
  input.write({ name: '10' });
  input.end();
});

test('sort stream with explicit order for some', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort(['carrot', '10']))
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (docs) {
      t.deepEqual(docs, [
        { name: 'carrot' },
        { name: '10' },
        { name: '2' },
        { name: 'apples' }
      ]);
      t.end();
    }));

  input.write({ name: 'apples' });
  input.write({ name: 'carrot' });
  input.write({ name: '2' });
  input.write({ name: '10' });
  input.end();
});
*/
