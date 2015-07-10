'use strict';

var splicer = require('stream-splicer'),
  json = require('./streams/output/json.js'),
  markdown = require('./streams/output/markdown.js'),
  htmlOutput = require('./streams/output/html.js');

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
