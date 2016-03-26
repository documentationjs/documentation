'use strict';

var doctrine = require('doctrine');
var flatteners = require('./flatteners');

/**
 * Parse a comment with doctrine, decorate the result with file position and code
 * context, handle parsing errors, and fix up various infelicities in the structure
 * outputted by doctrine.
 *
 * The following tags are treated as synonyms for a canonical tag:
 *
 *  * `@virtual` -> `@abstract`
 *  * `@extends` -> `@augments`
 *  * `@constructor` -> `@class`
 *  * `@const` -> `@constant`
 *  * `@defaultvalue` -> `@default`
 *  * `@desc` -> `@description`
 *  * `@host` -> `@external`
 *  * `@fileoverview`, `@overview` -> `@file`
 *  * `@emits` -> `@fires`
 *  * `@func`, `@method` -> `@function`
 *  * `@var` -> `@member`
 *  * `@arg`, `@argument` -> `@param`
 *  * `@prop` -> `@property`
 *  * `@return` -> `@returns`
 *  * `@exception` -> `@throws`
 *  * `@linkcode`, `@linkplain` -> `@link`
 *
 * The following tags are assumed to be singletons, and are flattened
 * to a top-level property on the result whose value is extracted from
 * the tag:
 *
 *  * `@name`
 *  * `@memberof`
 *  * `@classdesc`
 *  * `@kind`
 *  * `@class`
 *  * `@constant`
 *  * `@event`
 *  * `@external`
 *  * `@file`
 *  * `@function`
 *  * `@member`
 *  * `@mixin`
 *  * `@module`
 *  * `@namespace`
 *  * `@typedef`
 *  * `@access`
 *  * `@lends`
 *  * `@description`
 *  * `@summary`
 *  * `@copyright`
 *  * `@deprecated`
 *
 * The following tags are flattened to a top-level array-valued property:
 *
 *  * `@param` (to `params` property)
 *  * `@property` (to `properties` property)
 *  * `@returns` (to `returns` property)
 *  * `@augments` (to `augments` property)
 *  * `@example` (to `examples` property)
 *  * `@throws` (to `throws` property)
 *  * `@see` (to `sees` property)
 *  * `@todo` (to `todos` property)
 *
 * The `@global`, `@static`, `@instance`, and `@inner` tags are flattened
 * to a `scope` property whose value is `"global"`, `"static"`, `"instance"`,
 * or `"inner"`.
 *
 * The `@access`, `@public`, `@protected`, and `@private` tags are flattened
 * to an `access` property whose value is `"protected"` or `"private"`.
 * The assumed default value is `"public"`, so `@access public` or `@public`
 * tags result in no `access` property.
 *
 * @param {string} comment input to be parsed
 * @param {Object} loc location of the input
 * @param {Object} context code context of the input
 * @return {Comment} an object conforming to the
 * [documentation schema](https://github.com/documentationjs/api-json)
 */
function parseJSDoc(comment, loc, context) {
  var result = doctrine.parse(comment, {
    // have doctrine itself remove the comment asterisks from content
    unwrap: true,
    // enable parsing of optional parameters in brackets, JSDoc3 style
    sloppy: true,
    // `recoverable: true` is the only way to get error information out
    recoverable: true,
    // include line numbers
    lineNumbers: true
  });

  result.loc = loc;
  result.context = context;
  result.errors = [];

  result.tags.forEach(function (tag) {
    if (tag.errors) {
      for (var j = 0; j < tag.errors.length; j++) {
        result.errors.push({message: tag.errors[j]});
      }
    } else if (flatteners[tag.title]) {
      flatteners[tag.title](result, tag, tag.title);
    } else {
      result.errors.push({
        message: 'unknown tag @' + tag.title,
        commentLineNumber: tag.lineNumber
      });
    }
  });

  return result;
}

module.exports = parseJSDoc;
