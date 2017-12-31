#!/usr/bin/env node

// const
//   DocumentationEngine = require('@documentation/core').Engine,
//   JSONFormatter = require('@documentation/format-json');


// const docs = new DocumentationEngine();


// docs.parse(process.argv[2],{
//   access: ['private']
// })
// .then( comments => docs.format(comments, JSONFormatter))
// .then( files => {
//   console.log("DONE", files);
// })
// .catch(err => {
//   console.error(err);
// })



/* eslint no-console: 0 */

var yargs = require('yargs');
var commands = require('../lib/commands');

var argv = yargs
  .strict()
  .config()
  .pkgConf('documentation')
  // .command(commands.serve)
  .command(commands.build)
  // .command(commands.lint)
  // .command(commands.readme)
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