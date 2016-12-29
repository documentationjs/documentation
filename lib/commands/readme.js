'use strict';

var fs = require('fs');
var remark = require('remark');
var sharedOptions = require('./shared_options');
var inject = require('mdast-util-inject');
var chalk = require('chalk');
var disparity = require('disparity');
var build = require('./build');

module.exports.command = 'readme [input..]';
module.exports.description = 'inject documentation into your README.md';
/**
 * Add yargs parsing for the readme command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = {
  usage: 'Usage: documentation readme [--readme-file=README.md] --section "API"' +
    ' [--compare-only] [other documentationjs options]',
  'readme-file': {
    describe: 'The markdown file into which to inject documentation',
    default: 'README.md'
  },
  'section': {
    alias: 's',
    describe: 'The section heading after which to inject generated documentation',
    required: true
  },
  'diff-only': {
    alias: 'd',
    describe: 'Instead of updating the given README with the generated documentation,' +
      ' just check if its contents match, exiting nonzero if not.',
    default: false
  },
  'quiet': {
    alias: 'q',
    describe: 'Quiet mode: do not print messages or README diff to stdout.',
    default: false
  },
  example: 'documentation readme index.js -s "API Docs" --github'
};

function noop() {}

/**
 * Insert API documentation into a Markdown readme
 * @private
 * @param {Object} argv args from the CLI option parser
 * @return {undefined} has the side-effect of writing a file or printing to stdout
 */
module.exports.handler = function readme(argv) {
  argv._handled = true;
  argv = sharedOptions.expandInputs(argv);
  argv.format = 'remark';
  /* eslint no-console: 0 */
  var log = argv.q ? noop : console.log.bind(console, '[documentation-readme] ');
  var readmeFile = argv['readme-file'];

  build.handler(argv, onAst);

  function onAst(err, docsAst) {
    if (err) {
      throw err;
    }
    var readmeContent = fs.readFileSync(readmeFile, 'utf8');
    remark().use(plugin, {
      section: argv.section,
      toInject: JSON.parse(docsAst)
    }).process(readmeContent, onInjected.bind(null, readmeContent));
  }

  function onInjected(readmeContent, err, file) {

    if (err) {
      throw err;
    }

    var diffOutput = disparity.unified(readmeContent, file.contents, {
      paths: [readmeFile, readmeFile]
    });
    if (!diffOutput.length) {
      log(readmeFile + ' is up to date.');
      process.exit(0);
    }

    if (argv.d) {
      log(chalk.bold(readmeFile + ' needs the following updates:'), '\n' + diffOutput);
      process.exit(1);
    } else {
      log(chalk.bold('Updating ' + readmeFile), '\n' + diffOutput);
    }

    fs.writeFileSync(readmeFile, file.contents);
  }
};

// wrap the inject utility as an remark plugin
function plugin(remark, options) {
  return function transform(targetAst, file, next) {
    if (!inject(options.section, targetAst, options.toInject)) {
      return next(new Error('Heading ' + options.section + ' not found.'));
    }
    next();
  };
}
