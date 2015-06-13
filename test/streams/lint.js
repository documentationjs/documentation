'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  lint = require('../../streams/lint');

function evaluate(fn, callback) {
  var stream = parse(),
    consoleError = console.error,
    errors = [];

  console.error = function (error) {
    errors.push(error);
  };

  stream
    .pipe(lint())
    .pipe(concat(function (result) {
      console.error = consoleError;
      callback(result, errors);
    }));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
}

test('lint - non-canonical type', function (t) {
  evaluate(function () {
    /** @param {String} foo */
    return 0;
  }, function (result, errors) {
    t.equal(errors[0], 'test/streams/lint.js:2: type String found, string is standard');
    t.end();
  });
});
