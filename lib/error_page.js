var File = require('vinyl');
var ansiHTML = require('ansi-html');

var template = '<head><style>' +
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
 * @param {Error} error parse or generation error
 * @returns {Object} vinyl file object
 */
function errorPage(error) {
  var errorText = error.toString();
  if (error.codeFrame) {
    errorText += '<pre>' + ansiHTML(error.codeFrame) + '</pre>';
  }
  return new File({
    path: 'index.html',
    contents: new Buffer(template + errorText)
  });
}

module.exports = errorPage;
