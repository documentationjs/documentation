'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse');

function evaluate(fn, callback) {
  var stream = parse(),
    consoleError = console.error,
    errors = [];

  console.error = function (error) {
    errors.push(error);
  };

  stream
    .pipe(concat(function (result) {
      console.error = consoleError;
      callback(result, errors);
    }));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
}

test('parse - unknown tag', function (t) {
  evaluate(function () {
    /** @unknown */
    return 0;
  }, function (result) {
    t.equal(result[0].tags[0].title, 'unknown');
    t.end();
  });
});

test('parse - error', function (t) {
  evaluate(function () {
    /** @param {foo */
    return 0;
  }, function (result, errors) {
    t.equal(errors[0], 'test/streams/parse.js:2: Braces are not balanced');
    t.end();
  });
});
