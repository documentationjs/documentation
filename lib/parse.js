'use strict';

var doctrine = require('doctrine');
var extend = require('extend');

var synonyms = {
  'virtual': 'abstract',
  'extends': 'augments',
  'constructor': 'class',
  'const': 'constant',
  'defaultvalue': 'default',
  'desc': 'description',
  'host': 'external',
  'fileoverview': 'file',
  'overview': 'file',
  'emits': 'fires',
  'func': 'function',
  'method': 'function',
  'var': 'member',
  'arg': 'param',
  'argument': 'param',
  'prop': 'property',
  'return': 'returns',
  'exception': 'throws',
  'linkcode': 'link',
  'linkplain': 'link'
};

/**
 * Normalizes synonymous tags to the canonical tag type listed on http://usejsdoc.org/.
 *
 * For example, given the input object:
 *
 *     { tags: [
 *       { title: "virtual" },
 *       { title: "return", ... }
 *     ]}
 *
 * The output object will be:
 *
 *     { tags: [
 *       { title: "abstract" },
 *       { title: "returns", ... }
 *     ]}
 *
 * The following synonyms are normalized:
 *
 *  * virtual -> abstract
 *  * extends -> augments
 *  * constructor -> class
 *  * const -> constant
 *  * defaultvalue -> default
 *  * desc -> description
 *  * host -> external
 *  * fileoverview, overview -> file
 *  * emits -> fires
 *  * func, method -> function
 *  * var -> member
 *  * arg, argument -> param
 *  * prop -> property
 *  * return -> returns
 *  * exception -> throws
 *  * linkcode, linkplain -> link
 *
 * @param {Object} comment parsed comment
 * @return {Object} comment with normalized properties
 * @private
 */
function normalize(comment) {
  return extend({}, comment, {
    tags: comment.tags.map(function (tag) {
      var canonical = synonyms[tag.title];
      return canonical ? extend({}, tag, { title: canonical }) : tag;
    })
  });
}

function flattenName(result, tag) {
  result[tag.title] = tag.name;
}

function flattenDescription(result, tag) {
  result[tag.title] = tag.description;
}

function flattenTypedName(result, tag) {
  result[tag.title] = {
    name: tag.name
  };

  if (tag.type) {
    result[tag.title].type = tag.type;
  }
}

var flatteners = {
  'name': flattenName,
  'function': flattenName,
  'mixin': flattenName,
  'alias': flattenName,
  'memberof': flattenDescription,
  'version': flattenDescription,
  'since': flattenDescription,
  'copyright': flattenDescription,
  'author': flattenDescription,
  'license': flattenDescription,
  'classdesc': flattenDescription,
  'lends': flattenDescription,
  'event': flattenDescription,
  'external': flattenDescription,
  'file': flattenDescription,
  'callback': flattenDescription,
  'description': flattenDescription,
  'summary': flattenDescription,
  'deprecated': flattenDescription,
  'class': flattenTypedName,
  'constant': flattenTypedName,
  'member': flattenTypedName,
  'module': flattenTypedName,
  'namespace': flattenTypedName,
  'typedef': flattenTypedName,
  'kind': function (result, tag) {
    result.kind = tag.kind;
  },
  'property': function (result, tag) {
    if (!result.properties) {
      result.properties = [];
    }
    result.properties.push(tag);
  },
  'param': function (result, tag) {
    if (!result.params) {
      result.params = [];
    }
    result.params.push(tag);
  },
  'throws': function (result, tag) {
    if (!result.throws) {
      result.throws = [];
    }
    result.throws.push(tag);
  },
  'returns': function (result, tag) {
    if (!result.returns) {
      result.returns = [];
    }
    result.returns.push(tag);
  },
  'augments': function (result, tag) {
    if (!result.augments) {
      result.augments = [];
    }
    result.augments.push(tag);
  },
  'example': function (result, tag) {
    if (!result.examples) {
      result.examples = [];
    }
    result.examples.push(tag);
  },
  'see': function (result, tag) {
    if (!result.sees) {
      result.sees = [];
    }
    result.sees.push(tag.description);
  },
  'todo': function (result, tag) {
    if (!result.todos) {
      result.todos = [];
    }
    result.todos.push(tag.description);
  },
  'global': function (result) {
    result.scope = 'global';
  },
  'static': function (result) {
    result.scope = 'static';
  },
  'instance': function (result) {
    result.scope = 'instance';
  },
  'inner': function (result) {
    result.scope = 'inner';
  },
  'access': function (result, tag) {
    result.access = tag.access;
  },
  'public': function (result) {
    result.access = 'public';
  },
  'protected': function (result) {
    result.access = 'protected';
  },
  'private': function (result) {
    result.access = 'private';
  }
};

/**
 * Flattens tags in an opinionated way.
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
 * @param {Object} comment a parsed comment
 * @return {Object} comment with tags flattened
 * @private
 */
function flatten(comment) {
  var result = extend({}, comment);

  comment.tags.forEach(function (tag) {
    (flatteners[tag.title] || function () {})(result, tag);
  });

  return result;
}

/**
 * Parse a comment with doctrine, decorate the result with file position and code
 * context, handle parsing errors, and fix up various infelicities in the structure
 * outputted by doctrine.
 *
 * @param {string} comment input to be parsed
 * @param {Object} loc location of the input
 * @param {Object} context code context of the input
 * @return {Object} an object conforming to the
 * [documentation JSON API](https://github.com/documentationjs/api-json) schema
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

  var i = 0;
  while (i < result.tags.length) {
    var tag = result.tags[i];
    if (tag.errors) {
      for (var j = 0; j < tag.errors.length; j++) {
        result.errors.push({message: tag.errors[j]});
      }
      result.tags.splice(i, 1);
    } else {
      i++;
    }
  }

  return flatten(normalize(result));
}

module.exports = parseJSDoc;
