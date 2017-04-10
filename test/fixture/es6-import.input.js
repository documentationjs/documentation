import hasEx6 from './es6-ext';
import multiply from './simple.input.js';
import * as foo from 'some-other-module';

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
var multiplyTwice = a => a * multiply(a);

export default multiplyTwice;
