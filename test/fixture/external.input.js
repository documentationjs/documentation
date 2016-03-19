require('external');
require('external2');
require('module-not-found');
// non-js require
require('./polyglot/blend.cpp');

/**
 * I am in `external.input.js`.
 */
function foo() {
  'use strict';
  return 'bar';
}

module.exports = foo;
