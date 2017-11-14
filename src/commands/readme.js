/* @flow */

var path = require('path'),
  fs = require('fs'),
  remark = require('remark'),
  inject = require('mdast-util-inject'),
  chalk = require('chalk'),
  disparity = require('disparity'),
  documentation = require('../'),
  _ = require('lodash');

module.exports.command = 'readme [input..]';
module.exports.description = 'inject documentation into your README.md';
/**
 * Add yargs parsing for the readme command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = _.assign(
  {},
  {
    usage:
      'Usage: documentation readme [--readme-file=README.md] --section "API"' +
      ' [--compare-only] [other documentationjs options]',
    example: 'documentation readme index.js -s "API Docs" --github',
    'readme-file': {
      describe: 'The markdown file into which to inject documentation',
      default: 'README.md',
      type: 'string'
    },
    section: {
      alias: 's',
      describe:
        'The section heading after which to inject generated documentation',
      required: true,
      type: 'string'
    },
    'diff-only': {
      alias: 'd',
      describe:
        'Instead of updating the given README with the generated documentation,' +
        ' just check if its contents match, exiting nonzero if not.',
      default: false,
      type: 'boolean'
    },
    quiet: {
      alias: 'q',
      describe: 'Quiet mode: do not print messages or README diff to stdout.',
      default: false,
      type: 'boolean'
    },
    shallow: {
      describe:
        'shallow mode turns off dependency resolution, ' +
        'only processing the specified files (or the main script specified in package.json)',
      default: false,
      type: 'boolean'
    },
    'sort-order': {
      describe: 'The order to sort the documentation',
      choices: ['source', 'alpha'],
      default: 'source'
    }
  }
);

/**
 * Insert API documentation into a Markdown readme
 * @private
 * @param {Object} argv args from the CLI option parser
 * @returns {undefined} has the side-effect of writing a file or printing to stdout
 */
module.exports.handler = function readme(argv: Object) {
  argv._handled = true;

  if (!argv.input.length) {
    try {
      argv.input = [
        JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
          .main || 'index.js'
      ];
    } catch (e) {
      throw new Error(
        'documentation was given no files and was not run in a module directory'
      );
    }
  }

  argv.format = 'remark';
  /* eslint no-console: 0 */
  const log: Function = (...data: Array<string>) => {
    if (!argv.q) {
      console.log.apply(console, data);
    }
  };

  var readmeContent = fs.readFileSync(argv.readmeFile, 'utf8');

  documentation
    .build(argv.input, argv)
    .then(comments => documentation.formats.remark(comments, argv))
    .then(docsAst =>
      remark()
        .use(plugin, {
          section: argv.section,
          toInject: JSON.parse(docsAst)
        })
        .process(readmeContent)
    )
    .then(file => {
      var diffOutput = disparity.unified(readmeContent, file.contents, {
        paths: [argv.readmeFile, argv.readmeFile]
      });
      if (!diffOutput.length) {
        log(`${argv.readmeFile} is up to date.`);
        process.exit(0);
      }

      if (argv.d) {
        log(
          chalk.bold(`${argv.readmeFile} needs the following updates:`),
          `\n${diffOutput}`
        );
        process.exit(1);
      } else {
        log(chalk.bold(`Updating ${argv.readmeFile}`), `\n${diffOutput}`);
      }

      fs.writeFileSync(argv.readmeFile, file.contents);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
};

// wrap the inject utility as an remark plugin
function plugin(options) {
  return function transform(targetAst, file, next) {
    if (!inject(options.section, targetAst, options.toInject)) {
      return next(new Error(`Heading ${options.section} not found.`));
    }
    next();
  };
}
