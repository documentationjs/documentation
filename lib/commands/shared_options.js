/**
 * Adds shared options to any command that runs documentation
 *
 * @param {Object} parser yargs object
 * @returns {Object} same yargs object with options
 * @private
 */
function sharedInputOptions(parser) {
  return parser.option('shallow', {
    describe: 'shallow mode turns off dependency resolution, ' +
    'only processing the specified files (or the main script specified in package.json)',
    default: false,
    type: 'boolean'
  })
  .option('config', {
    describe: 'configuration file. an array defining explicit sort order',
    alias: 'c'
  })
  .option('external', {
    describe: 'a string / glob match pattern that defines which external ' +
      'modules will be whitelisted and included in the generated documentation.',
    default: null
  })
  .option('extension', {
    describe: 'only input source files matching this extension will be parsed, ' +
      'this option can be used multiple times.',
    alias: 'e'
  })
  .option('polyglot', {
    type: 'boolean',
    describe: 'polyglot mode turns off dependency resolution and ' +
      'enables multi-language support. use this to document c++'
  })
  .option('private', {
    describe: 'generate documentation tagged as private',
    type: 'boolean',
    default: false,
    alias: 'p'
  })
  .option('access', {
    describe: 'Include only comments with a given access level, out of private, ' +
      'protected, public, undefined. By default, public, protected, and undefined access ' +
      'levels are included',
    choices: ['public', 'private', 'protected', 'undefined'],
    alias: 'a'
  })
  .option('github', {
    type: 'boolean',
    describe: 'infer links to github in documentation',
    alias: 'g'
  })
  .option('infer-private', {
    type: 'string',
    describe: 'Infer private access based on the name. This is a regular expression that ' +
      'is used to match the name'
  });
}

/**
 * Adds shared options to any command that runs documentation
 *
 * @param {Object} parser yargs object
 * @returns {Object} same yargs object with options
 * @private
 */
function sharedOutputOptions(parser) {
  return parser.option('theme', {
    describe: 'specify a theme: this must be a valid theme module',
    alias: 't'
  })
  .option('name', {
    describe: 'project name. by default, inferred from package.json'
  })
  .option('watch', {
    describe: 'watch input files and rebuild documentation when they change',
    alias: 'w',
    type: 'boolean'
  })
  .option('project-version', {
    describe: 'project version. by default, inferred from package.json'
  })
  .help('help');
}

module.exports.sharedOutputOptions = sharedOutputOptions;
module.exports.sharedInputOptions = sharedInputOptions;
