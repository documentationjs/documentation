var args = require('yargs')
  .usage('Usage: $0 <command> [options]')

  .option('f', {
    alias: 'format',
    default: 'json',
    choices: ['json', 'md', 'html']
  })

  .describe('lint', 'check output for common style and uniformity mistakes')

  .describe('t', 'specify a theme: this must be a valid theme module')
  .alias('t', 'theme')

  .boolean('p')
  .describe('p', 'generate documentation tagged as private')
  .alias('p', 'private')

  .describe('name', 'project name. by default, inferred from package.json')
  .describe('version', 'project version. by default, inferred from package.json')

  .option('shallow', {
    describe: 'shallow mode turns off dependency resolution, ' +
    'only processing the specified files (or the main script specified in package.json)',
    default: false,
    type: 'boolean'
  })

  .boolean('polyglot')
  .describe('polyglot', 'polyglot mode turns off dependency resolution and ' +
            'enables multi-language support. use this to document c++')

  .boolean('g')
  .describe('g', 'infer links to github in documentation')
  .alias('g', 'github')

  .option('o', {
    describe: 'output location. omit for stdout, otherwise is a filename ' +
      'for single-file outputs and a directory name for multi-file outputs like html',
    alias: 'output',
    default: 'stdout'
  })

  .describe('c', 'configuration file. an array defining explicit sort order')
  .alias('c', 'config')

  .help('h')
  .alias('h', 'help')

  .example('$0 foo.js', 'parse documentation in a given file');

module.exports = args;
