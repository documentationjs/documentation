import hasEx6 from './es6-ext';
import multiply from './simple.input.js';
import * as foo from 'some-other-module';

// Disable dynamic imports for now until
// https://github.com/thgreasi/babel-plugin-system-import-transformer
// can be updated to support babel 7.
// import('./simple.input.js').then(() => {});

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
var multiplyTwice = a => a * multiply(a);

export default multiplyTwice;
