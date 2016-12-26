var fs = require('fs');
var path = require('path');
var glob = require('glob');
var shell = require('shelljs');

/**
 * Replace Windows with posix style paths
 *
 * @param {string} filepath   Path to convert
 * @returns {string}          Converted filepath
 */
function convertPathToPosix(filepath) {
  var normalizedFilepath = path.normalize(filepath);
  var posixFilepath = normalizedFilepath.replace(/\\/g, '/');

  return posixFilepath;
}

/**
 * Checks if a provided path is a directory and returns a glob string matching
 * all files under that directory if so, the path itself otherwise.
 *
 * Reason for this is that `glob` needs `/**` to collect all the files under a
 * directory where as our previous implementation without `glob` simply walked
 * a directory that is passed. So this is to maintain backwards compatibility.
 *
 * Also makes sure all path separators are POSIX style for `glob` compatibility.
 *
 * @param {string[]} [extensions=['.js']] An array of accepted extensions
 * @returns {Function} A function that takes a pathname and returns a glob that
 *                     matches all files with the provided extensions if
 *                     pathname is a directory.
 */
function processPath(extensions) {
  var cwd = process.cwd();
  extensions = extensions || ['.js'];

  extensions = extensions.map(function (ext) {
    return ext.replace(/^\./, '');
  });

  var suffix = '/**';

  if (extensions.length === 1) {
    suffix += '/*.' + extensions[0];
  } else {
    suffix += '/*.{' + extensions.join(',') + '}';
  }

  /**
   * A function that converts a directory name to a glob pattern
   *
   * @param {string} pathname The directory path to be modified
   * @returns {string} The glob path or the file path itself
   * @private
   */
  return function (pathname) {
    var newPath = pathname;
    var resolvedPath = path.resolve(cwd, pathname);

    if (shell.test('-d', resolvedPath)) {
      newPath = pathname.replace(/[/\\]$/, '') + suffix;
    }

    return convertPathToPosix(newPath);
  };
}

/**
 * Resolves any directory patterns into glob-based patterns for easier handling.
 * @param   {string[]} patterns    File patterns (such as passed on the command line).
 * @param   {Array<string>} extensions       A list of file extensions
 * @returns {string[]} The equivalent glob patterns and filepath strings.
 */
function resolveFileGlobPatterns(patterns, extensions) {
  var processPathExtensions = processPath(extensions);
  return patterns.map(processPathExtensions);
}

/**
 * Build a list of absolute filesnames on which ESLint will act.
 * Ignored files are excluded from the results, as are duplicates.
 *
 * @param   {string[]} globPatterns            Glob patterns.
 * @returns {string[]} Resolved absolute filenames.
 */
function listFilesToProcess(globPatterns) {
  var files = [],
    added = Object.create(null);

  var cwd = process.cwd();

  /**
   * Executes the linter on a file defined by the `filename`. Skips
   * unsupported file extensions and any files that are already linted.
   * @param {string} filename The file to be processed
   * @returns {void}
   */
  function addFile(filename) {
    if (added[filename]) {
      return;
    }
    files.push(filename);
    added[filename] = true;
  }

  globPatterns.forEach(function (pattern) {
    var file = path.resolve(cwd, pattern);
    if (shell.test('-f', file)) {
      addFile(fs.realpathSync(file), !shell.test('-d', file));
    } else {
      var globOptions = {
        nodir: true,
        dot: true,
        cwd,
      };

      glob.sync(pattern, globOptions).forEach(function (globMatch) {
        addFile(path.resolve(cwd, globMatch), false);
      });
    }
  });

  return files;
}

function smartGlob(indexes, extensions) {
  return listFilesToProcess(
    resolveFileGlobPatterns(indexes, extensions)
  );
}

module.exports = smartGlob;
