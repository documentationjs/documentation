'use strict';

var yaml = require('js-yaml'),
  fs = require('fs'),
  path = require('path'),
  stripComments = require('strip-json-comments');

/**
 * Try to load a configuration file: since this is configuration, we're
 * lenient with respect to its structure. It can be JSON or YAML,
 * and can contain comments, unlike normal JSON.
 *
 * @param {string} filePath the user-provided path to configuration
 * @returns {Object} configuration, if it can be parsed
 * @throws {Error} if the file cannot be read.
 */
function loadConfig(filePath) {
  try {
    return yaml.safeLoad(
      stripComments(
        fs.readFileSync(
          path.resolve(process.cwd(), filePath), 'utf8')));
  } catch (e) {
    e.message = 'Cannot read config file: ' +
      filePath +
      '\nError: ' +
      e.message;
    throw e;
  }
}

module.exports = loadConfig;
