var File = require('vinyl');
var ansiHTML = require('ansi-html');

var template = '<head><style>' +
  'body{padding:20px;font:16px monospace;background:#CC0000;color:#fff;}' +
  'pre{background:#fff}' +
  '</style></head>';

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
