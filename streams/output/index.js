'use strict';

var json = require('./json.js'),
  markdown = require('./markdown.js'),
  htmlOutput = require('./html.js');

module.exports = {
  json: function () {
    return json();
  },
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
