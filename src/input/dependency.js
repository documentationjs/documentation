import mdeps from './moduleDeps.js';
import internalOnly from '../module_filters.js';
import smartGlob from './smart_glob.js';

/**
 * Returns a array of dependencies, given an array of entry
 * points and an object of options to provide to module-deps.
 *
 * This stream requires filesystem access, and thus isn't suitable
 * for a browser environment.
 *
 * @param indexes paths to entry files as strings
 * @param config optional options passed
 * @returns results
 */
export default async function dependencyStream(
  indexes,
  { parseExtension = [], requireExtension = [] }
) {
  const md = await mdeps(smartGlob(indexes, parseExtension), {
    /**
     * Determine whether a module should be included in documentation
     * @param {string} id path to a module
     * @returns {boolean} true if the module should be included.
     */
    filter: id => internalOnly(id),
    extensions: [...parseExtension, ...requireExtension]
  });

  return md;
}
