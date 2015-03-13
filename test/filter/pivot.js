'use strict';

var test = require('prova'),
  pivot = require('../../filter/pivot'),
  concat = require('concat-stream');

test('pivots singular tags', function (t) {
  var stream = pivot();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      tags: {
        name: [{ title: 'name', 'name': '...' }],
        example: [{ title: 'example', description: '1' }]
      }
    }]);
    t.end();
  }));

  stream.end({ tags: [ { title: 'name', name: '...' }, { title: 'example', description: '1' } ] });
});

test('pivots multiple tags', function (t) {
  var stream = pivot();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      tags: {
        example: [ { title: 'example', description: '1' }, {
          title: 'example',
          description: '2'
        } ]
      }
    }]);
    t.end();
  }));

  stream.end({ tags: [ { title: 'example', description: '1' }, { title: 'example', description: '2' } ] });
});
