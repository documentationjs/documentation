'use strict';

var test = require('tap').test,
  highlight = require('../../streams/highlight'),
  concat = require('concat-stream');

test('processes examples', function (t) {
  var stream = highlight();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      examples: [
        '<span class="hljs-keyword">var</span> x = <span class="hljs-number">1</span>;'
      ]
    }]);
    t.end();
  }));

  stream.end({
    examples: [
      'var x = 1;'
    ]
  });
});
