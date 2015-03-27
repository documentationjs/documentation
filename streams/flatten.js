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
 *
 * The following tags are flattened to a top-level array-valued property:
 *
 *  * `@param` (to `params` property)
 *  * `@returns` (to `returns` property)
 *
 * The `@static` and `@instance` tags are flattened to a `scope` property
 * whose value is `"static"` or `"instance"`.
 *
 * The `@access`, `@public`, `@protected`, and `@private` tags are flattened
 * to an `access` property whose value is `"protected"` or `"private"`.
 * The assumed default value is `"public"`, so `@access public` or `@public`
 * tags result in no `access` property.
 *
 * @name flatten
 * @return {stream.Transform}
 */
module.exports = function() {
  return through(function(comment) {
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
  'param': function (result, tag) {
    if (!result.params) {
      result.params = [];
    }
    result.params.push(tag);
  },
  'returns': function (result, tag) {
    if (!result.returns) {
      result.returns = [];
    }
    result.returns.push(tag);
  },
  'static': function (result, tag) {
    result.scope = 'static';
  },
  'instance': function (result, tag) {
    result.scope = 'instance';
  },
  'access': function (result, tag) {
    if (tag.access === 'public') {
      delete result.access;
    } else {
      result.access = tag.access;
    }
  },
  'public': function (result, tag) {
    delete result.access;
  },
  'protected': function (result, tag) {
    result.access = 'protected';
  },
  'private': function (result, tag) {
    result.access = 'private';
  }
};
