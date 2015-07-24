'use strict';

var test = require('tap').test,
  normalize = require('../../streams/normalize'),
  concat = require('concat-stream');

test('normalizes tags', function (t) {
  var stream = normalize();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      tags: [ { title: 'returns' }, { title: 'augments' }, { title: 'name' } ]
    }]);
    t.end();
  }));

  stream.end({ tags: [ { title: 'return' }, { title: 'extends' }, { title: 'name' } ] });
});
