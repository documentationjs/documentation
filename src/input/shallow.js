const smartGlob = require('../smart_glob.js');

/**
 * A readable source for content that doesn't do dependency resolution, but
 * simply reads files and pushes them onto a stream.
 *
 * If an array of strings is provided as input to this method, then
 * they will be treated as filenames and read into the stream.
 *
 * If an array of objects is provided, then we assume that they are valid
 * objects with `source` and `file` properties, and don't use the filesystem
 * at all. This is one way of getting documentation.js to run in a browser
 * or without fs access.
 *
 * @param indexes entry points
 * @param config parsing options
 * @returns promise with parsed files
 */
module.exports = function (indexes, config) {
  const objects = [];
  const strings = [];
  for (const index of indexes) {
    if (typeof index === 'string') {
      strings.push(index);
    } else if (typeof index === 'object') {
      objects.push(index);
    } else {
      return Promise.reject(
        new Error('Indexes should be either strings or objects')
      );
    }
  }
  return Promise.resolve(
    objects.concat(
      smartGlob(strings, config.parseExtension).map(file => ({
        file
      }))
    )
  );
};
