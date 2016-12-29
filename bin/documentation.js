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
  .fail(function (msg, error) {
    if (error) {
      throw error;
    } else {
      yargs.showHelp('error');
      console.error(msg);
      return yargs.exit(1);
    }
  })
  .version(function () {
    return require('../package').version;
  })
  .usage('Usage:\n\n' +
    '# generate markdown docs for index.js and files it references\n' +
    '$0 build index.js -f md\n\n' +

    '# generate html docs for all files in src\n' +
    '$0 build src/** -f html -o docs\n\n' +

    '# document index.js, ignoring any files it requires or imports\n' +
    '$0 build index.js -f md --shallow\n\n' +

    '# build, serve, and live-update html docs for app.js\n' +
    '$0 serve app.js\n\n' +

    '# validate JSDoc syntax in util.js\n' +
    '$0 lint util.js\n\n' +

    '# update the API section of README.md with docs from index.js\n' +
    '$0 readme index.js --section=API\n\n' +

    '# build docs for all values exported by index.js\n' +
    '$0 build --document-exported index.js'
  )
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
