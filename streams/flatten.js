'use strict';

var through = require('through'),
  extend = require('extend');

/**
 * Create a transform stream that flattens tags in an opinionated way.
 *
 * The following tags are assumed to be singletons, and are flattened
 * to a top-level property on the result whose value is extracted from
 * the tag:
 *
 *  * `@name`
 *  * `@memberof`
 *  * `@classdesc`
 *  * `@kind`
 *  * `@access`
 *
 * The following tags are flattened to a top-level array-valued property:
 *
 *  * `@param` (to `params` property)
 *  * `@property` (to `properties` property)
 *  * `@returns` (to `returns` property)
 *  * `@example` (to `examples` property)
 *  * `@throws` (to `throws` property)
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
 * @name flatten
 * @return {stream.Transform}
 */
module.exports = function () {
  return through(function (comment) {
    var result = extend({}, comment);

    comment.tags.forEach(function (tag) {
      (flatteners[tag.title] || function () {})(result, tag);
    });

    this.push(result);
  });
};

var flatteners = {
  'name': function (result, tag) {
    result.name = tag.name;
  },
  'memberof': function (result, tag) {
    result.memberof = tag.description;
  },
  'classdesc': function (result, tag) {
    result.classdesc = tag.description;
  },
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
    result.examples.push(tag.description);
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
