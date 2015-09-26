'use strict';

var markdown = require('./markdown.js'),
  htmlOutput = require('./html.js');

module.exports = {
  md: function (options) {
    options = options || {};
    return markdown({
      name: options.name,
      theme: options.theme,
      version: options.version
    });
  },
  html: function (options) {
    options = options || {};
    return htmlOutput({
      name: options.name,
      theme: options.theme,
      version: options.version
    });
  }
};
