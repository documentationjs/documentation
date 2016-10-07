#!/usr/bin/env node

/* eslint no-console: 0 */

'use strict';

var yargs = require('yargs'),
  commands = require('../lib/commands');

var argv = yargs
  .command(commands.serve)
  .command(commands.build)
  .command(commands.lint)
  .command(commands.readme)
  .version(function () {
    return require('../package').version;
  })
  .recommendCommands()
  .help()
  .argv;

if (argv.private) {
  console.error('--private is deprecated, please use the --access (or -a) option instead');
  console.error('for example: -a public -a private -a protected -a undefined');
}

if (!argv._handled) {
  yargs.showHelp('error');
  process.exit(1);
}


if (!yargs.argv._.length) {
  yargs.showHelp();
}
