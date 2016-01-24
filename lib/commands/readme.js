'use strict';

var fs = require('fs');
var remark = require('remark');
var inject = require('mdast-util-inject');
var chalk = require('chalk');
var disparity = require('disparity');
var build = require('./build');

module.exports = readme;
module.exports.description = 'inject documentation into your README.md';
module.exports.parseArgs = function (yargs) {
  yargs.usage('Usage: $0 readme [--readme-file=README.md] --section "API"' +
    ' [--compare-only] [other documentationjs options]')
  .option('readme-file', {
    describe: 'The markdown file into which to inject documentation',
    default: 'README.md'
  })
  .option('section', {
    alias: 's',
    describe: 'The section heading after which to inject generated documentation',
    required: true
  })
  .option('diff-only', {
    alias: 'd',
    describe: 'Instead of updating the given README with the generated documentation,' +
      ' just check if its contents match, exiting nonzero if not.',
    default: false
  })
  .option('quiet', {
    alias: 'q',
    describe: 'Quiet mode: do not print messages or README diff to stdout.',
    default: false
  })
  .help('help')
  .example('$0 readme index.js -s "API Docs" --github');
};

function readme(documentation, parsedArgs) {
  var readmeOptions = parsedArgs.commandOptions;
  readmeOptions.format = 'remark';
  /* eslint no-console: 0 */
  var log = readmeOptions.q ? function () {}
  : console.log.bind(console, '[documentation-readme] ');
  var readmeFile = readmeOptions['readme-file'];

  build(documentation, parsedArgs, onAst);

  function onAst(err, docsAst) {
    if (err) {
      throw err;
    }
    var readmeContent = fs.readFileSync(readmeFile, 'utf8');
    remark.use(plugin, {
      section: readmeOptions.section,
      toInject: docsAst
    }).process(readmeContent, onInjected.bind(null, readmeContent));
  }

  function onInjected(readmeContent, err, file, content) {
    if (err) {
      throw err;
    }

    var diffOutput = disparity.unified(readmeContent, content, {
      paths: [readmeFile, readmeFile]
    });
    if (!diffOutput.length) {
      log(readmeFile + ' is up to date.');
      process.exit(0);
    }

    if (readmeOptions.d) {
      log(chalk.bold(readmeFile + ' needs the following updates:'), '\n' + diffOutput);
      process.exit(1);
    } else {
      log(chalk.bold('Updating ' + readmeFile), '\n' + diffOutput);
    }

    fs.writeFileSync(readmeFile, content);
  }
}

// wrap the inject utility as an remark plugin
function plugin(remark, options) {
  return function transform(targetAst, file, next) {
    if (!inject(options.section, targetAst, options.toInject)) {
      return next(new Error('Heading ' + options.section + ' not found.'));
    }
    next();
  };
}
