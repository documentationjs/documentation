// Skip external modules. Based on http://git.io/pzPO.
const internalModuleRegexp =
  process.platform === 'win32'
    ? /* istanbul ignore next */
      /^(\.|\w:)/
    : /^[/.]/;

/**
 * Module filters
 */
export default id => internalModuleRegexp.test(id);
