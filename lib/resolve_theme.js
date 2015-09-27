'use strict';

var path = require('path'),
  resolve = require('resolve');

/**
 * Given the name of a theme as a module, return the directory it
 * resides in, or throw an error if it is not found
 * @param {string} theme the module name
 * @throws {Error} if theme is not found
 * @returns {string} directory
 */
function resolveTheme(theme) {
  try {
    return path.dirname(resolve.sync(theme, { basedir: process.cwd() }));
  } catch(e) {
    throw new Error('Theme ' + theme + ' not found');
  }
}

module.exports = resolveTheme;
