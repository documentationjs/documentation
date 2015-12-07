#!/usr/bin/env node

'use strict';

var documentation = require('../'),
  path = require('path'),
  yargs = require('yargs'),
  extend = require('extend'),
  loadConfig = require('../lib/load_config.js'),
  commands = require('../lib/commands');

var parsedArgs = parseArgs();
commands[parsedArgs.command](documentation, parsedArgs);

function parseArgs() {
  // reset() needs to be called at parse time because the yargs module uses an
  // internal global variable to hold option state
  var argv = yargs
    .usage('Usage: $0 <command> [options]')
    .version(function () {
      return require('../package').version;
    })
    .option('shallow', {
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
    .option('github', {
      type: 'boolean',
      describe: 'infer links to github in documentation',
      alias: 'g'
    })
  .argv;

  var options = {};
  if (argv.config) {
    options = loadConfig(argv.config);
  }
  options = extend(options, argv);

  var command = argv._[0],
    inputs = argv._.slice(1);

  if (inputs.length == 0) {
    try {
      var p = require(path.resolve('package.json'));
      options.package = p;
      inputs = [p.main || 'index.js'];
    } catch (e) {
      yargs.showHelp();
      throw new Error('documentation was given no files and was not run in a module directory');
    }
  }

  return {
    inputs: inputs,
    command: command,
    commandOptions: addCommands(yargs).argv,
    options: options
  };
}

function addCommands(parser) {
  parser = parser.demand(1);
  for (var cmd in commands) {
    parser = parser.command(cmd, commands[cmd].description, commands[cmd].parseArgs);
  }
  return parser.help('help');
}

