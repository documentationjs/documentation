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
  var ext = path.extname(filePath);
  var absFilePath = path.resolve(process.cwd(), filePath);
  var rawFile = fs.readFileSync(absFilePath, 'utf8');

  try {
    if (ext === '.json') {
      return processToc(JSON.parse(stripComments(rawFile)));
    }

    return processToc(yaml.safeLoad(rawFile));
  } catch (e) {
    e.message = 'Cannot read config file: ' +
      filePath +
      '\nError: ' +
      e.message;
    throw e;
  }

  function processToc(config) {
    if (!config || !config.toc) {
      return config;
    }

    config.toc = config.toc.map(function (entry) {
      if (entry && entry.file) {
        entry.file = path.join(
          path.dirname(absFilePath),
          entry.file
        );
      }

      return entry;
    });

    return config;
  }
}

module.exports = loadConfig;
