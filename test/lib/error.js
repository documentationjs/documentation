'use strict';

var test = require('prova'),
  util = require('util'),
  path = require('path'),
  error = require('../../lib/error');

test('error', function (t) {
  var comment = {
    context: {
      file: path.join(process.cwd(), 'file.js'),
      loc: {
        start: {
          line: 1,
          column: 2
        },
        end: {
          line: 3,
          column: 4
        }
      }
    }
  };

  t.deepEqual(error(comment, 'test'), 'file.js:1: test');
  t.deepEqual(error(comment, '%s', 'test'), 'file.js:1: test');

  t.end();
});
