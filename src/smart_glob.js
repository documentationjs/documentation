const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Replace Windows with posix style paths
 *
 * @param {string} filepath   Path to convert
 * @returns {string}          Converted filepath
 */
function convertPathToPosix(filepath) {
  const normalizedFilepath = path.normalize(filepath);
  const posixFilepath = normalizedFilepath.replace(/\\/g, '/');

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
  const cwd = process.cwd();
  extensions = extensions || ['.js'];

  extensions = extensions.map(function (ext) {
    return ext.replace(/^\./, '');
  });

  let suffix = '/**';

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
    let newPath = pathname;
    const resolvedPath = path.resolve(cwd, pathname);

    if (
      fs.existsSync(resolvedPath) &&
      fs.lstatSync(resolvedPath).isDirectory()
    ) {
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
  const processPathExtensions = processPath(extensions);
  return patterns.map(processPathExtensions);
}

/**
 * Build a list of absolute filenames on which ESLint will act.
 * Ignored files are excluded from the results, as are duplicates.
 *
 * @param globPatterns            Glob patterns.
 * @returns Resolved absolute filenames.
 */
function listFilesToProcess(globPatterns) {
  const files = [];
  const added = new Set();

  const cwd = process.cwd();

  /**
   * Executes the linter on a file defined by the `filename`. Skips
   * unsupported file extensions and any files that are already linted.
   * @param {string} filename The file to be processed
   * @returns {void}
   */
  function addFile(filename) {
    if (added.has(filename)) {
      return;
    }
    files.push(filename);
    added.add(filename);
  }

  globPatterns.forEach(function (pattern) {
    const file = path.resolve(cwd, pattern);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      addFile(fs.realpathSync(file));
    } else {
      const globOptions = {
        nodir: true,
        dot: true,
        cwd
      };

      glob.sync(pattern, globOptions).forEach(function (globMatch) {
        addFile(path.resolve(cwd, globMatch));
      });
    }
  });

  return files;
}

function smartGlob(indexes, extensions) {
  return listFilesToProcess(resolveFileGlobPatterns(indexes, extensions));
}

module.exports = smartGlob;
