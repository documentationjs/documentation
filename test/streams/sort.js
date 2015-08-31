'use strict';

var test = require('tap').test,
  concat = require('concat-stream'),
  sort = require('../../streams/sort'),
  stream = require('stream');

test('sort stream alphanumeric', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort())
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (docs) {
      t.deepEqual(docs, [
        { name: 'apples' },
        { name: 'bananas' },
        { name: 'carrot' }
      ]);
      t.end();
    }));

  input.write({ name: 'apples' });
  input.write({ name: 'carrot' });
  input.write({ name: 'bananas' });
  input.end();
});

test('sort stream with numbers', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort())
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (docs) {
      t.deepEqual(docs, [
        { name: '10' },
        { name: '2' },
        { name: 'apples' },
        { name: 'carrot'}
      ]);
      t.end();
    }));

  input.write({ name: 'apples' });
  input.write({ name: 'carrot' });
  input.write({ name: '2' });
  input.write({ name: '10' });
  input.end();
});

test('sort stream with explicit order for all', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
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
