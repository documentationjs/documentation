import fs from 'fs';
import path from 'path';
import glob from 'tiny-glob';

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
function processPath(extensions = ['.js']) {
  const cwd = process.cwd();

  extensions = extensions.map(ext => ext.replace(/^\./, ''));

  let suffix = '/**/*.';

  if (extensions.length === 1) {
    suffix += extensions[0];
  } else {
    suffix += `{${extensions.join(',')}}`;
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

const cwd = process.cwd();
const globOptions = {
  filesOnly: true,
  dot: true,
  cwd
};

/**
 * Build a list of absolute filenames on which ESLint will act.
 * Ignored files are excluded from the results, as are duplicates.
 *
 * @param globPatterns            Glob patterns.
 * @returns Resolved absolute filenames.
 */
async function listFilesToProcess(globPatterns) {
  const promises = globPatterns.map(async pattern => {
    const file = path.resolve(cwd, pattern);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return fs.realpathSync(file);
    }
    return (await glob(pattern, globOptions)).map(globMatch =>
      path.resolve(cwd, globMatch)
    );
  });

  const files = (await Promise.all(promises)).flat();
  return Array.from(new Set(files));
}

export default function smartGlob(indexes, extensions) {
  return listFilesToProcess(resolveFileGlobPatterns(indexes, extensions));
}
