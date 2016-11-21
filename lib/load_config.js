'use strict';

var yaml = require('js-yaml'),
  fs = require('fs'),
  path = require('path'),
  stripComments = require('strip-json-comments'),
  _ = require('lodash');

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
  var ext = _.last(filePath.split('.'));
  var rawFile = fs.readFileSync(
    path.resolve(process.cwd(), filePath), 'utf8'
  );

  try {
    if (ext === 'json') {
      return JSON.parse(stripComments(rawFile));
    }

    return yaml.safeLoad(rawFile);
  } catch (e) {
    e.message = 'Cannot read config file: ' +
      filePath +
      '\nError: ' +
      e.message;
    throw e;
  }
}

module.exports = loadConfig;
