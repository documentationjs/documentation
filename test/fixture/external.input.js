require('external');
require('external2');
require('module-not-found');

/**
 * I am in `external.input.js`.
 */
function foo() {
  'use strict';
  return 'bar';
}

module.exports = foo;
