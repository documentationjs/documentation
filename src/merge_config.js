const yaml = require('js-yaml');
const fs = require('fs');
const pify = require('pify');
const readPkgUp = require('read-pkg-up');
const path = require('path');
const stripComments = require('strip-json-comments');

function processToc(config, absFilePath) {
  if (!config || !config.toc) {
    return config;
  }

  config.toc = config.toc.map(entry => {
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
      .then(pkg => {
        ['name', 'homepage', 'version', 'description'].forEach(key => {
          config[`project-${key}`] = config[`project-${key}`] || pkg.pkg[key];
        });
        return config;
      })
      // Allow this to fail: this inference is not required.
      .catch(() => config)
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
    const filePath = config.config;
    const ext = path.extname(filePath);
    const absFilePath = path.resolve(process.cwd(), filePath);
    return pify(fs)
      .readFile(absFilePath, 'utf8')
      .then(rawFile => {
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
    'mjs',
    'js',
    'jsx',
    'es5',
    'es6',
    'vue'
  ]);

  return mergeConfigFile(config).then(mergePackage);
}

module.exports = mergeConfig;
