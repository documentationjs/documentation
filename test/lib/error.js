'use strict';

var test = require('tap').test,
  path = require('path'),
  error = require('../../lib/error');

test('error', function (t) {
  var tag = {
    lineNumber: 2
  };

  var comment = {
    context: {
      file: path.join(process.cwd(), 'file.js')
    },
    loc: {
      start: {
        line: 1
      }
    }
  };

  t.deepEqual(error(tag, comment, 'test'), 'file.js:3: test');
  t.deepEqual(error(tag, comment, '%s', 'test'), 'file.js:3: test');

  t.end();
});
