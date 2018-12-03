/* eslint no-console: 0 */
const File = require('vinyl');
const ansiHTML = require('ansi-html');

const template =
  '<head><style>' +
  'body{padding:20px;font:18px monospace;background:#880000;color:#fff;}' +
  '</style></head>';

ansiHTML.setColors({
  reset: ['fff', '800'],
  black: 'aaa', // String
  red: '9ff',
  green: 'f9f',
  yellow: '99f',
  blue: 'ff9',
  magenta: 'f99',
  cyan: '9f9',
  lightgrey: 'ccc',
  darkgrey: 'aaa'
});

/**
 * Given an error, generate an HTML page that represents the error.
 * @param error parse or generation error
 * @returns {Object} vinyl file object
 */
function errorPage(error) {
  let errorText = error.toString();
  console.error(error);
  if (error.codeFrame) {
    errorText += '<pre>' + ansiHTML(error.codeFrame) + '</pre>';
  }
  return new File({
    path: 'index.html',
    contents: new Buffer(template + errorText)
  });
}

module.exports = errorPage;
