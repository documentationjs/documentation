/**
 * Adds shared options to any command that runs documentation
 */
module.exports.sharedInputOptions = {
  babel: {
    describe:
      'path to babelrc or babel.options.js to override default babel config',
    type: 'string',
    default: null
  },
  shallow: {
    describe:
      'shallow mode turns off dependency resolution, ' +
      'only processing the specified files (or the main script specified in package.json)',
    default: false,
    type: 'boolean'
  },
  config: {
    describe: 'configuration file. an array defining explicit sort order',
    alias: 'c',
    type: 'string'
  },
  'no-package': {
    describe:
      'dont find and use package.json for project- configuration option defaults',
    alias: 'np',
    type: 'boolean',
    default: false
  },
  external: {
    describe:
      'a string / glob match pattern that defines which external ' +
      'modules will be whitelisted and included in the generated documentation.',
    default: null
  },
  'require-extension': {
    describe:
      "additional extensions to include in require() and import's search algorithm." +
      'For instance, adding .es5 would allow require("adder") to find "adder.es5"',
    // Ensure that the value is an array
    coerce: value => [].concat(value),
    alias: 're'
  },
  'parse-extension': {
    describe: 'additional extensions to parse as source code.',
    // Ensure that the value is an array
    coerce: value => [].concat(value),
    alias: 'pe'
  },
  private: {
    describe: 'generate documentation tagged as private',
    type: 'boolean',
    default: false,
    alias: 'p'
  },
  access: {
    describe:
      'Include only comments with a given access level, out of private, ' +
      'protected, public, undefined. By default, public, protected, and undefined access ' +
      'levels are included',
    choices: ['public', 'private', 'protected', 'undefined'],
    array: true,
    alias: 'a'
  },
  github: {
    type: 'boolean',
    describe: 'infer links to github in documentation',
    alias: 'g'
  },
  'infer-private': {
    type: 'string',
    describe:
      'Infer private access based on the name. This is a regular expression that ' +
      'is used to match the name'
  },
  'document-exported': {
    type: 'boolean',
    describe:
      'Generate documentation for all exported bindings and members ' +
      'even if there is no JSDoc for them',
    default: false
  },
  'sort-order': {
    describe: 'The order to sort the documentation',
    choices: ['source', 'alpha'],
    default: 'source'
  },
  resolve: {
    describe: 'Dependency resolution algorithm.',
    choices: ['browser', 'node'],
    default: 'browser'
  }
};

/**
 * Adds shared options to any command that runs documentation
 */
module.exports.sharedOutputOptions = {
  theme: {
    describe: 'specify a theme: this must be a valid theme module',
    alias: 't'
  },
  'project-name': {
    describe: 'project name. by default, inferred from package.json'
  },
  'project-version': {
    describe: 'project version. by default, inferred from package.json'
  },
  'project-description': {
    describe: 'project description. by default, inferred from package.json'
  },
  'project-homepage': {
    describe: 'project homepage. by default, inferred from package.json'
  },
  favicon: {
    describe: 'favicon used in html'
  },
  format: {
    alias: 'f',
    default: 'json',
    choices: ['json', 'md', 'remark', 'html']
  },
  watch: {
    describe: 'watch input files and rebuild documentation when they change',
    alias: 'w',
    type: 'boolean'
  },
  'markdown-toc': {
    describe: 'include a table of contents in markdown output',
    default: true,
    type: 'boolean'
  },
  'markdown-toc-max-depth': {
    describe:
      'specifies the max depth of the table of contents in markdown output',
    default: 6,
    type: 'number'
  }
};
