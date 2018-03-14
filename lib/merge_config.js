'use strict';

var yaml = require('js-yaml');
var fs = require('fs');
var pify = require('pify');
var readPkgUp = require('read-pkg-up');
var path = require('path');
var stripComments = require('strip-json-comments');

function processToc(config, absFilePath) {
  if (!config || !config.toc) {
    return config;
  }

  config.toc = config.toc.map(function(entry) {
    if (entry && entry.file) {
      entry.file = path.join(path.dirname(absFilePath), entry.file);
    }

    return entry;
  });

  return config;
}

/**
 * Use the nearest package.json file for the default
 * values of `name` and `version` config.
 *
 * @param {Object} config the user-provided config, usually via argv
 * @returns {Promise<Object>} configuration with inferred parameters
 * @throws {Error} if the file cannot be read.
 */
function mergePackage(config) {
  if (config.noPackage) {
    return Promise.resolve(config);
  }
  return (
    readPkgUp()
      .then(function(pkg) {
        ['name', 'homepage', 'version'].forEach(function(key) {
          config[`project-${key}`] = config[`project-${key}`] || pkg.pkg[key];
        });
        return config;
      })
      // Allow this to fail: this inference is not required.
      .catch(function() {
        return config;
      })
  );
}

/**
 * Merge a configuration file into program config, assuming that the location
 * of the configuration file is given as one of those config.
 *
 * @param {Object} config the user-provided config, usually via argv
 * @returns {Promise<Object>} configuration, if it can be parsed
 * @throws {Error} if the file cannot be read.
 */
function mergeConfigFile(config) {
  if (config && typeof config.config === 'string') {
    var filePath = config.config;
    var ext = path.extname(filePath);
    var absFilePath = path.resolve(process.cwd(), filePath);
    return pify(fs)
      .readFile(absFilePath, 'utf8')
      .then(function(rawFile) {
        if (ext === '.json') {
          return Object.assign(
            {},
            config,
            processToc(JSON.parse(stripComments(rawFile)), absFilePath)
          );
        }
        return Object.assign(
          {},
          config,
          processToc(yaml.safeLoad(rawFile), absFilePath)
        );
      });
  }

  return Promise.resolve(config || {});
}

function mergeConfig(config) {
  config.parseExtension = (config.parseExtension || []).concat([
    'js',
    'jsx',
    'es5',
    'es6'
  ]);

  return mergeConfigFile(config).then(mergePackage);
}

module.exports = mergeConfig;
