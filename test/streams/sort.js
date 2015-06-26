'use strict';

var test = require('prova'),
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
    .pipe(concat(function (deps) {
      t.equal(
        JSON.stringify(deps),
        '[{"tags":[{"title":"name","name":"apples"}]},{"tags":[{"title":"name","name":"bananas"}]},{"tags":[{"title":"name","name":"carrot"}]}]'
      );
      t.end();
    }));

  input.write({
    tags: [ { 'title': 'name', 'name': 'apples' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': 'carrot' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': 'bananas' } ]
  });

  input.end();
});

test('sort stream with numbers', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort())
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (deps) {
      t.equal(
        JSON.stringify(deps),
        '[{"tags":[{"title":"name","name":"10"}]},{"tags":[{"title":"name","name":"2"}]},{"tags":[{"title":"name","name":"apples"}]},{"tags":[{"title":"name","name":"carrot"}]}]'
      );
      t.end();
    }));

  input.write({
    tags: [ { 'title': 'name', 'name': 'apples' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': 'carrot' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '2' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '10' } ]
  });

  input.end();
});

test('sort stream with explicit order for all', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort(['apples', '2', 'carrot', '10']))
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (deps) {
      t.equal(
        JSON.stringify(deps),
        '[{"tags":[{"title":"name","name":"apples"}]},{"tags":[{"title":"name","name":"2"}]},{"tags":[{"title":"name","name":"carrot"}]},{"tags":[{"title":"name","name":"10"}]}]'
      );
      t.end();
    }));

  input.write({
    tags: [ { 'title': 'name', 'name': 'apples' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': 'carrot' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '2' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '10' } ]
  });

  input.end();
});

test('sort stream with explicit order for some', function (t) {
  var input = new stream.PassThrough({ objectMode: true });

  input
    .pipe(sort(['carrot', '10']))
    .on('error', function (err) {
      throw err;
    })
    .pipe(concat(function (deps) {
      t.equal(
        JSON.stringify(deps),
        '[{"tags":[{"title":"name","name":"carrot"}]},{"tags":[{"title":"name","name":"10"}]},{"tags":[{"title":"name","name":"2"}]},{"tags":[{"title":"name","name":"apples"}]}]'
      );
      t.end();
    }));

  input.write({
    tags: [ { 'title': 'name', 'name': 'apples' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': 'carrot' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '2' } ]
  });

  input.write({
    tags: [ { 'title': 'name', 'name': '10' } ]
  });

  input.end();
});
