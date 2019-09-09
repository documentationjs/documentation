const fs = require('fs');
const remark = require('remark');
const path = require('path');
const documentation = require('../');
const sharedOptions = require('./shared_options');
const inject = require('mdast-util-inject');
const chalk = require('chalk');
const diff = require('diff');
const getReadmeFile = require('../get-readme-file');

module.exports.command = 'readme [input..]';
module.exports.description = 'inject documentation into your README.md';

const defaultReadmeFile = getReadmeFile('.');

/**
 * Add yargs parsing for the readme command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = Object.assign(
  {},
  sharedOptions.sharedOutputOptions,
  sharedOptions.sharedInputOptions,
  {
    'readme-file': {
      describe: 'The markdown file into which to inject documentation',
      default: defaultReadmeFile
    },
    section: {
      alias: 's',
      describe:
        'The section heading after which to inject generated documentation',
      required: true
    },
    'diff-only': {
      alias: 'd',
      describe:
        'Instead of updating the given README with the generated documentation,' +
        ' just check if its contents match, exiting nonzero if not.',
      default: false
    },
    quiet: {
      alias: 'q',
      describe: 'Quiet mode: do not print messages or README diff to stdout.',
      default: false
    }
  }
);

/**
 * Insert API documentation into a Markdown readme
 * @private
 * @param {Object} argv args from the CLI option parser
 * @returns {undefined} has the side-effect of writing a file or printing to stdout
 */
module.exports.handler = function readme(argv) {
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

  argv.noReferenceLinks = true;
  argv.format = 'remark';
  /* eslint no-console: 0 */
  const log = (...data) => {
    if (!argv.q) {
      console.log.apply(console, data);
    }
  };

  const readmeContent = fs.readFileSync(argv.readmeFile, 'utf8');

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
      const diffRaw = diff.createPatch(
        '',
        readmeContent,
        file.contents,
        '',
        ''
      );
      if (diffRaw.split('\n').length === 5) {
        log(`${argv.readmeFile} is up to date.`);
        process.exit(0);
      }

      // Replace diff headers with real values
      const cleanedDiff = diffRaw
        .replace(/^([^\n]+)\n([^\n]+)\n/m, '')
        .replace(/^---.*/gm, `--- ${argv.readmeFile}\tremoved`)
        .replace(/^\+\+\+.*/gm, `+++ ${argv.readmeFile}\tadded`);

      // Includes newlines for easier joins
      const diffLines = cleanedDiff.split(/^/m);
      const diffHeader = diffLines
        .slice(0, 2)
        .join('')
        .replace(/[^\n\r]+/g, chalk.yellow('$&'));
      const diffBody = diffLines
        .slice(2)
        .join('')
        .replace(/^-[^\n\r]*/gm, chalk.red('$&'))
        .replace(/^\+[^\n\r]*/gm, chalk.green('$&'))
        .replace(/^@@.+@@/gm, chalk.magenta('$&'));

      if (argv.d) {
        log(
          chalk.bold(`${argv.readmeFile} needs the following updates:`),
          `\n${diffHeader}${diffBody}`
        );
        process.exit(1);
      } else {
        log(
          chalk.bold(`Updating ${argv.readmeFile}`),
          `\n${diffHeader}${diffBody}`
        );
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
