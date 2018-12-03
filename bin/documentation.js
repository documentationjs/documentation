#!/usr/bin/env node

/* eslint no-console: 0 */

const yargs = require('yargs');
const commands = require('../src/commands');

const argv = yargs
  .strict()
  .command(commands.serve)
  .command(commands.build)
  .command(commands.lint)
  .command(commands.readme)
  .fail(function(msg, error) {
    if (error) {
      throw error;
    } else {
      yargs.showHelp('error');
      console.error(msg);
      return yargs.exit(1);
    }
  })
  .example('documentation build foo.js -f md > API.md')
  .example('documentation readme index.js -s "API Docs" --github')
  .version()
  .usage(
    `Usage:

  # generate markdown docs for index.js and files it references 
  $0 build index.js -f md 

  # generate html docs for all files in src 
  $0 build src/** -f html -o docs 

  # document index.js, ignoring any files it requires or imports 
  $0 build index.js -f md --shallow 

  # build, serve, and live-update html docs for app.js 
  $0 serve app.js 

  # validate JSDoc syntax in util.js 
  $0 lint util.js 

  # update the API section of README.md with docs from index.js 
  $0 readme index.js --section=API 

  # build docs for all values exported by index.js 
  $0 build --document-exported index.js
`
  )
  .recommendCommands()
  .help().argv;

if (argv.private) {
  console.error(
    '--private is deprecated, please use the --access (or -a) option instead'
  );
  console.error('for example: -a public -a private -a protected -a undefined');
}

if (!argv._handled) {
  yargs.showHelp('error');
  process.exit(1);
}
