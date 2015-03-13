'use strict';

var test = require('prova'),
  normalize = require('../../filter/normalize'),
  concat = require('concat-stream');

test('normalizes tags', function (t) {
  var stream = normalize();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      tags: [ { title: 'returns' }, { title: 'augments' } ]
    }]);
    t.end();
  }));

  stream.end({ tags: [ { title: 'return' }, { title: 'extends' } ] });
});
