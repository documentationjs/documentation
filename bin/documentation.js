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

  var commandArgv = addCommands(yargs)
    .version(function () {
      return require('../package').version;
    })
    .argv;

  var argv = commands[commandArgv._[0]]
    .parseArgs(yargs.reset()).argv;

  var options = {};
  if (argv.config) {
    options = loadConfig(argv.config);
  }
  options = extend(options, argv);

  if (typeof options.access === 'string') {
    options.access = [options.access];
  }

  if (options.private) {
    options.access = (options.access || ['public', 'undefined', 'protected']).concat(['private']);
  }

  var command = argv._[0],
    inputs = argv._.slice(1);

  if (!commands[command]) {
    yargs.showHelp();
    var suggestion = [argv['$0'], 'build'].concat(process.argv.slice(2)).join(' ');
    process.stderr.write('Unknown command: ' + command + '.  Did you mean "' + suggestion + '"?\n');
    process.exit(1);
  }

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

function addCommands(parser, descriptionOnly) {
  return Object.keys(commands).reduce(function(parser, cmd) {
    return parser.command(cmd, commands[cmd].description);
  }, parser.demand(1)).help('help');
}

