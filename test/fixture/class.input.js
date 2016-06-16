// /**
//  * This is my class, a demo thing.
//  * @class MyClass
//  * @property {number} howMany how many things it contains
//  */
// function MyClass() {
//   this.howMany = 2;
// }
// 
// /**
//  * Get the number 42
//  * @param {boolean} getIt whether to get the number
//  * @returns {number} forty-two
//  */
// MyClass.prototype.getFoo = function (getIt) {
//   return getIt ? 42 : 0;
// };
// 
// /**
//  * Get undefined
//  * @returns {undefined} does not return anything.
//  */
// MyClass.prototype.getUndefined = function () { };
// 
// /**
//  * A colon-separated name
//  * @returns {undefined} does not return anything.
//  */
// MyClass.prototype['colon:name'] = function () { };

/**
 * A colon-separated name specified manually
 *
 * @name "colon:foo"
 * @returns {undefined} does not return anything.
 */
MyClass.prototype['colon:foo'] = function () { };
