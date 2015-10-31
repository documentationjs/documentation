'use strict';

var path = require('path'),
  resolve = require('resolve');

/**
 * Given the name of a theme as a module, return the directory it
 * resides in, or throw an error if it is not found
 * @param {string} [theme='documentation-theme-default'] the module name
 * @throws {Error} if theme is not found
 * @returns {string} directory
 */
function resolveTheme(theme) {
  var basedir = theme ? process.cwd() : __dirname;

  theme = theme || 'documentation-theme-default';

  try {
    return path.dirname(resolve.sync(theme, { basedir: basedir }));
  } catch (e) {
    throw new Error('Theme ' + theme + ' not found');
  }
}

module.exports = resolveTheme;
