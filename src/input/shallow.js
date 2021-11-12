import smartGlob from './smart_glob.js';
import readFileCode from './readFileCode.js';

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
export default async function (indexes, config) {
  const objects = [];
  const paths = indexes.filter(v => {
    if (typeof v === 'object') {
      v.file = v.file ?? '';
      objects.push(v);
      return false;
    }
    return typeof v === 'string';
  });
  const files = await Promise.all(
    smartGlob(paths, config.parseExtension).map(async file => ({
      source: await readFileCode(file),
      file
    }))
  );

  return [...objects, ...files];
}
