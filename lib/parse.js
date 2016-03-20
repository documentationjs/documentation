'use strict';

var doctrine = require('doctrine');
var remark = require('remark');
var inlineTokenizer = require('./inline_tokenizer');

function parseMarkdown(string) {
  return remark.use(inlineTokenizer).parse(string);
}

var flatteners = {
  'abstract': flattenBoolean,
  'access': function (result, tag) {
    result.access = tag.access;
  },
  'alias': flattenName,
  'arg': synonym('param'),
  'argument': synonym('param'),
  'augments': function (result, tag) {
    if (!result.augments) {
      result.augments = [];
    }
    result.augments.push(tag);
  },
  'author': flattenDescription,
  'borrows': todo,
  'callback': flattenDescription,
  'class': flattenTypedName,
  'classdesc': flattenMarkdownDescription,
  'const': synonym('constant'),
  'constant': flattenTypedName,
  'constructor': synonym('class'),
  'constructs': todo,
  'copyright': flattenMarkdownDescription,
  'default': todo,
  'defaultvalue': synonym('default'),
  'deprecated': flattenMarkdownDescription,
  'desc': synonym('description'),
  'description': flattenMarkdownDescription,
  'emits': synonym('fires'),
  'enum': todo,
  'event': flattenDescription,
  'example': function (result, tag) {
    if (!tag.description) {
      result.errors.push({
        message: '@example without code',
        commentLineNumber: tag.lineNumber
      });
      return;
    }

    if (!result.examples) {
      result.examples = [];
    }

    var example = {
      description: tag.description
    };

    if (tag.caption) {
      example.caption = parseMarkdown(tag.caption);
    }

    result.examples.push(example);
  },
  'exception': synonym('throws'),
  'exports': todo,
  'extends': synonym('augments'),
  'external': flattenDescription,
  'file': flattenDescription,
  'fileoverview': synonym('file'),
  'fires': todo,
  'func': synonym('function'),
  'function': flattenName,
  'global': function (result) {
    result.scope = 'global';
  },
  'host': synonym('external'),
  'ignore': flattenBoolean,
  'implements': todo,
  'inheritdoc': todo,
  'inner': function (result) {
    result.scope = 'inner';
  },
  'instance': function (result) {
    result.scope = 'instance';
  },
  'interface': function (result, tag) {
    result.interface = true;
    if (tag.description) {
      result.name = tag.description;
    }
  },
  'kind': function (result, tag) {
    result.kind = tag.kind;
  },
  'lends': flattenDescription,
  'license': flattenDescription,
  'listens': todo,
  'member': flattenTypedName,
  'memberof': flattenDescription,
  'method': synonym('function'),
  'mixes': todo,
  'mixin': flattenName,
  'module': flattenTypedName,
  'name': flattenName,
  'namespace': flattenTypedName,
  'override': flattenBoolean,
  'overview': synonym('file'),
  'param': function (result, tag) {
    if (!result.params) {
      result.params = [];
    }

    var param = {
      name: tag.name,
      lineNumber: tag.lineNumber // TODO: remove
    };

    if (tag.description) {
      param.description = parseMarkdown(tag.description);
    }

    if (tag.type) {
      param.type = tag.type;
    }

    result.params.push(param);
  },
  'private': function (result) {
    result.access = 'private';
  },
  'prop': synonym('property'),
  'property': function (result, tag) {
    if (!result.properties) {
      result.properties = [];
    }

    var property = {
      name: tag.name,
      lineNumber: tag.lineNumber // TODO: remove
    };

    if (tag.description) {
      property.description = parseMarkdown(tag.description);
    }

    if (tag.type) {
      property.type = tag.type;
    }

    result.properties.push(property);
  },
  'protected': function (result) {
    result.access = 'protected';
  },
  'public': function (result) {
    result.access = 'public';
  },
  'readonly': flattenBoolean,
  'requires': todo,
  'return': synonym('returns'),
  'returns': function (result, tag) {
    if (!result.returns) {
      result.returns = [];
    }

    var returns = {
      description: parseMarkdown(tag.description)
    };

    if (tag.type) {
      returns.type = tag.type;
    }

    result.returns.push(returns);
  },
  'see': function (result, tag) {
    if (!result.sees) {
      result.sees = [];
    }
    result.sees.push(parseMarkdown(tag.description));
  },
  'since': flattenDescription,
  'static': function (result) {
    result.scope = 'static';
  },
  'summary': flattenMarkdownDescription,
  'this': todo,
  'throws': function (result, tag) {
    if (!result.throws) {
      result.throws = [];
    }

    var throws = {};

    if (tag.description) {
      throws.description = parseMarkdown(tag.description);
    }

    if (tag.type) {
      throws.type = tag.type;
    }

    result.throws.push(throws);
  },
  'todo': function (result, tag) {
    if (!result.todos) {
      result.todos = [];
    }
    result.todos.push(parseMarkdown(tag.description));
  },
  'tutorial': todo,
  'type': todo,
  'typedef': flattenTypedName,
  'var': synonym('member'),
  'variation': function (result, tag) {
    result.variation = tag.variation;
  },
  'version': flattenDescription,
  'virtual': synonym('abstract')
};

function todo() {}

function synonym(key) {
  return function (result, tag) {
    return flatteners[key](result, tag, key);
  };
}

function flattenBoolean(result, tag, key) {
  result[key] = true;
}

function flattenName(result, tag, key) {
  result[key] = tag.name;
}

function flattenDescription(result, tag, key) {
  result[key] = tag.description;
}

function flattenMarkdownDescription(result, tag, key) {
  result[key] = parseMarkdown(tag.description);
}

function flattenTypedName(result, tag, key) {
  result[key] = {
    name: tag.name
  };

  if (tag.type) {
    result[key].type = tag.type;
  }
}

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

  if (result.description) {
    result.description = parseMarkdown(result.description);
  }

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
