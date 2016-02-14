import multiply from "./es6.input.js";
import * as foo from "some-other-module";

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
var multiplyTwice = (a) => a * multiply(a);

export default multiplyTwice;
