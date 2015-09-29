'use strict';

var test = require('tap').test,
  highlight = require('../../lib/highlight');

test('processes examples', function (t) {
  t.deepEqual(highlight({
    examples: [
      'var x = 1;'
    ]
  }), {
    examples: [
      '<span class="hljs-keyword">var</span> x = <span class="hljs-number">1</span>;'
    ]
  });
  t.end();
});
