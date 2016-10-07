var path = require('path');
var loadConfig = require('../load_config');

/**
 * Adds shared options to any command that runs documentation
 *
 * @param {Object} parser yargs object
 * @returns {Object} same yargs object with options
 * @private
 */
module.exports.sharedInputOptions = {
  'shallow': {
    describe: 'shallow mode turns off dependency resolution, ' +
    'only processing the specified files (or the main script specified in package.json)',
    default: false,
    type: 'boolean'
  },
  'config': {
    config: true,
    describe: 'configuration file. an array defining explicit sort order',
    alias: 'c',
    configParser: function (configPath) {
      return loadConfig(configPath);
    }
  },
  'external': {
    describe: 'a string / glob match pattern that defines which external ' +
      'modules will be whitelisted and included in the generated documentation.',
    default: null
  },
  'extension': {
    describe: 'only input source files matching this extension will be parsed, ' +
      'this option can be used multiple times.',
    alias: 'e'
  },
  'polyglot': {
    type: 'boolean',
    describe: 'polyglot mode turns off dependency resolution and ' +
      'enables multi-language support. use this to document c++'
  },
  'private': {
    describe: 'generate documentation tagged as private',
    type: 'boolean',
    default: false,
    alias: 'p'
  },
  'access': {
    describe: 'Include only comments with a given access level, out of private, ' +
      'protected, public, undefined. By default, public, protected, and undefined access ' +
      'levels are included',
    choices: ['public', 'private', 'protected', 'undefined'],
    array: true,
    alias: 'a'
  },
  'github': {
    type: 'boolean',
    describe: 'infer links to github in documentation',
    alias: 'g'
  },
  'infer-private': {
    type: 'string',
    describe: 'Infer private access based on the name. This is a regular expression that ' +
      'is used to match the name'
  },
  'document-exported': {
    type: 'boolean',
    describe: 'Generate documentation for all exported bindings and members ' +
      'even if there is no JSDoc for them',
    default: false
  },
  'sort-order': {
    describe: 'The order to sort the documentation',
    choices: ['source', 'alpha'],
    default: 'source'
  }
};

/**
 * Adds shared options to any command that runs documentation
 *
 * @param {Object} parser yargs object
 * @returns {Object} same yargs object with options
 * @private
 */
module.exports.sharedOutputOptions = {
  theme: {
    describe: 'specify a theme: this must be a valid theme module',
    alias: 't'
  },
  name: {
    describe: 'project name. by default, inferred from package.json'
  },
  watch: {
    describe: 'watch input files and rebuild documentation when they change',
    alias: 'w',
    type: 'boolean'
  },
  'project-version': {
    describe: 'project version. by default, inferred from package.json'
  }
};

module.exports.expandInputs = function (argv) {
  if (argv.input === undefined || argv.input.length == 0) {
    try {
      var p = require(path.resolve('package.json'));
      argv.package = p;
      argv.input = [p.main || 'index.js'];
      return argv;
    } catch (e) {
      throw new Error('documentation was given no files and was not run in a module directory');
    }
  } else {
    return argv;
  }
};
