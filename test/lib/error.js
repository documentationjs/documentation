'use strict';

var test = require('tap').test,
  path = require('path'),
  formatError = require('../../lib/format_error');

test('formatError', function (t) {
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

  t.deepEqual(formatError(comment, {
    message: 'test'
  }), 'file.js:1: test');

  t.deepEqual(formatError(comment, {
    message: 'test',
    commentLineNumber: 1
  }), 'file.js:2: test');

  t.end();
});
