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
      template: options.mdtemplate,
      name: options.name,
      version: options.version
    });
  },
  html: function (options) {
    options = options || {};
    return htmlOutput({
      name: options.name,
      version: options.version
    });
  }
};
