import conf from './config.js';
import yaml from 'js-yaml';
import fs from 'fs';
import pify from 'pify';
import { readPackageUp } from 'read-pkg-up';
import path from 'path';
import stripComments from 'strip-json-comments';

function normalizeToc(config, basePath) {
  if (!config || !config.toc) {
    return config;
  }

  config.toc = config.toc.map(entry => {
    if (entry && entry.file) {
      entry.file = path.join(basePath, entry.file);
    }
    return entry;
  });

  return config;
}

/**
 * Use the nearest package.json file for the default
 * values of `name` and `version` config.
 *
 * @param {boolean} noPackage options which prevent ge info about project from package.json
 * @returns {Promise<Object>} configuration with inferred parameters
 */
async function readPackage(noPackage) {
  const global = conf.globalConfig;
  if (noPackage) {
    return {};
  }
  const param = ['name', 'homepage', 'version', 'description'];
  try {
    const { packageJson } = await readPackageUp();
    return param.reduce((res, key) => {
      res[`project-${key}`] = global[key] || packageJson[key];
      return res;
    }, {});
  } catch (e) {
    return {};
  }
}

/**
 * Merge a configuration file into program config, assuming that the location
 * of the configuration file is given as one of those config.
 *
 * @param {String} config the user-provided config path, usually via argv
 * @returns {Promise<Object>} configuration, which are parsed
 * @throws {Error} if the file cannot be read.
 */
async function readConfigFile(config) {
  if (typeof config !== 'string') {
    return {};
  }
  const filePath = config;
  const absFilePath = path.resolve(process.cwd(), filePath);
  const rawFile = await pify(fs).readFile(absFilePath, 'utf8');
  const basePath = path.dirname(absFilePath);

  let obj = null;
  if (path.extname(filePath) === '.json') {
    obj = JSON.parse(stripComments(rawFile));
  } else {
    obj = yaml.load(rawFile);
  }
  if ('noPackage' in obj) {
    obj['no-package'] = obj.noPackage;
    delete obj.noPackage;
  }
  return normalizeToc(obj, basePath);
}

export default async function mergeConfig(config = {}) {
  conf.add(config);
  conf.add(await readConfigFile(conf.globalConfig.config));
  conf.add(await readPackage(conf.globalConfig['no-package']));

  return conf.globalConfig;
}
