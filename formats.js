'use strict';

var splicer = require('stream-splicer'),
  json = require('./streams/output/json.js'),
  markdown = require('./streams/output/markdown.js'),
  htmlOutput = require('./streams/output/html.js'),
  docset = require('./streams/output/docset.js');

module.exports = {
  json: function () {
    return json();
  },
  docset: function (options) {
    return splicer.obj([htmlOutput({
      hideSidebar: true,
      name: options.name,
      version: options.version
    }), docset({
      name: options.name,
      version: options.version
    })]);
  },
  md: function (options) {
    return markdown({
      template: options.mdtemplate,
      name: options.name,
      version: options.version
    });
  },
  html: function (options) {
    return htmlOutput({
      name: options.name,
      version: options.version
    });
  }
};
