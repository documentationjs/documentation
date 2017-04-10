'use strict';
/* @flow */

var mdeps = require('module-deps-sortable');
var path = require('path');
var babelify = require('babelify');
var concat = require('concat-stream');
var moduleFilters = require('../../lib/module_filters');
var smartGlob = require('../smart_glob.js');

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
function dependencyStream(
  indexes /*: Array<string>*/,
  config /*: DocumentationConfig */
) /*: Promise<Array<SourceFile>>*/ {
  var md = mdeps({
    /**
     * Determine whether a module should be included in documentation
     * @param {string} id path to a module
     * @returns {boolean} true if the module should be included.
     */
    filter: id => !!config.external || moduleFilters.internalOnly(id),
    extensions: []
      .concat(config.requireExtension || [])
      .map(ext => '.' + ext.replace(/^\./, ''))
      .concat(['.js', '.json', '.es6', '.jsx']),
    transform: [
      babelify.configure({
        sourceMap: false,
        compact: false,
        presets: [
          require('babel-preset-es2015'),
          require('babel-preset-stage-0'),
          require('babel-preset-react')
        ],
        plugins: [
          require('babel-plugin-transform-decorators-legacy').default,
          // Required to support webpack's System.import
          // https://github.com/documentationjs/documentation/issues/578
          require('babel-plugin-system-import-transformer').default
        ]
      })
    ],
    postFilter: moduleFilters.externals(indexes, config)
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
