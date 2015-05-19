'use strict';

var through = require('through'),
  fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  extend = require('extend');

/**
 * Wrap Markdown-formatted API documentation in a format suitable for
 * README.md files.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.template='../../share/readme.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @param {Object?} pkg a parsed package.json file. Without this option,
 * this stream simply passes its input unchanged.
 * @name markdown
 * @return {stream.Transform}
 */
module.exports = function (opts, pkg) {

  var options = extend({}, {
    template: path.resolve(path.join(__dirname, '../../share/readme.hbs'))
  }, opts);

  var template = Handlebars.compile(fs.readFileSync(options.template, 'utf8'));

  return through(function (api) {
    if (!pkg) return this.push(api);
    this.push(template({
      api: api
    }));
  });
};
