var parse = require('../../src/parsers/javascript'),
  lintComments = require('../../src/lint').lintComments,
  formatLint = require('../../src/lint').formatLint;

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(fn) {
  return lintComments(toComment(fn, 'input.js'));
}

test('lintComments', function() {
  expect(
    evaluate(function() {
      /**
   * @param {foo
   */
    }).errors
  ).toEqual([
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' }
  ]);

  expect(
    evaluate(function() {
      /**
      * @param {Object} foo.bar
      */
    }).errors
  ).toEqual([{ commentLineNumber: 1, message: 'Parent of foo.bar not found' }]);

  expect(
    evaluate(function() {
      /**
   * @param {String} foo
   * @param {array} bar
   */
    }).errors
  ).toEqual([
    {
      commentLineNumber: 1,
      message: 'type String found, string is standard'
    },
    { commentLineNumber: 2, message: 'type array found, Array is standard' }
  ]);

  expect(
    evaluate(function() {
      /**
   * @param {string} foo
   */
    }).errors
  ).toEqual([]);
});

test('formatLint', function() {
  var comment = evaluate(function() {
    // 2
    // 3
    /** 4
     * @param {String} foo
     * @param {array} bar
     * @param {foo
     */
  });

  var formatted = formatLint([comment]);

  expect(formatted.match(/input.js/g));
  expect(formatted.match(/4:1[^\n]+Braces are not balanced/g));
  expect(formatted.match(/4:1[^\n]+Missing or invalid tag name/g));
  expect(formatted.match(/5:1[^\n]+type String found, string is standard/g));
  expect(formatted.match(/6:1[^\n]+type array found, Array is standard/g));
  expect(formatted.match(/4 warnings/g));
});
