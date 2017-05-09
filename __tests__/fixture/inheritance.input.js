/**
 * With ES6, built-in types are extensible!
 */
class SpecialArray extends Array {
  additionalMethod() {}
}

/** @class Foo */
module.exports = class Foo extends Bar {};
