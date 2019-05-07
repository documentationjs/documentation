const mdeps = require('module-deps-sortable');
const path = require('path');
const babelify = require('babelify');
const concat = require('concat-stream');
const moduleFilters = require('../module_filters');
const { standardBabelParserPlugins } = require('../parsers/parse_to_ast');
const smartGlob = require('../smart_glob.js');

const STANDARD_BABEL_CONFIG = {
  sourceMaps: false,
  compact: false,
  cwd: path.resolve(__dirname, '../../'),
  presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-flow'],
  parserOpts: { plugins: standardBabelParserPlugins },
  plugins: [
    // Stage 0
    '@babel/plugin-proposal-function-bind',
    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
    '@babel/plugin-proposal-do-expressions',
    // Stage 2
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings'
  ]
};

/**
 * Returns a readable stream of dependencies, given an array of entry
 * points and an object of options to provide to module-deps.
 *
 * This stream requires filesystem access, and thus isn't suitable
 * for a browser environment.
 *
 * @param indexes paths to entry files as strings
 * @param config optional options passed
 * @returns results
 */
function dependencyStream(indexes, config) {
  const babelConfig = config.babel
    ? { configFile: path.resolve(__dirname, '../../../../', config.babel) }
    : STANDARD_BABEL_CONFIG;
  const md = mdeps({
    /**
     * Determine whether a module should be included in documentation
     * @param {string} id path to a module
     * @returns {boolean} true if the module should be included.
     */
    filter: id => !!config.external || moduleFilters.internalOnly(id),
    extensions: []
      .concat(config.requireExtension || [])
      .map(ext => '.' + ext.replace(/^\./, ''))
      .concat(['.mjs', '.js', '.json', '.es6', '.jsx']),
    transform: [babelify.configure(babelConfig)],
    postFilter: moduleFilters.externals(indexes, config),
    resolve:
      config.resolve === 'node' &&
      ((id, opts, cb) => {
        const r = require('resolve');
        opts.basedir = path.dirname(opts.filename);
        r(id, opts, cb);
      })
  });
  smartGlob(indexes, config.parseExtension).forEach(index => {
    md.write(path.resolve(index));
  });
  md.end();

  return new Promise((resolve, reject) => {
    md.once('error', reject);
    md.pipe(
      concat(function(inputs) {
        resolve(
          inputs
            .filter(
              input =>
                // At this point, we may have allowed a JSON file to be caught by
                // module-deps, or anything else allowed by requireExtension.
                // otherwise module-deps would complain about
                // it not being found. But Babel can't parse JSON, so we filter non-JavaScript
                // files away.
                config.parseExtension.indexOf(
                  path.extname(input.file).replace(/^\./, '')
                ) > -1
            )
            .map(input => {
              // remove source file, since it's transformed anyway
              delete input.source;
              return input;
            })
        );
      })
    );
  });
}

module.exports = dependencyStream;
