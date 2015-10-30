'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Get a Handlebars template file out of a theme and compile it into
 * a template function
 *
 * @param {Object} Handlebars handlebars instance
 * @param {string} themeModule base directory of themey
 * @param {string} name template name
 * @returns {Function} template function
 */
function getTemplate(Handlebars, themeModule, name) {
  try {
    return Handlebars
      .compile(fs.readFileSync(path.join(themeModule, name), 'utf8'));
  } catch (e) {
    throw new Error('Template file ' + name + ' missing');
  }
}

module.exports = getTemplate;
