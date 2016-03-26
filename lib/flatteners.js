var flatteners = {
  'abstract': flattenBoolean,
  'access': propKey('access', 'access'),
  'alias': prop('name'),
  'arg': synonym('param'),
  'argument': synonym('param'),
  'augments': collect('augments'),
  'author': prop('description'),
  'borrows': todo,
  'callback': prop('description'),
  'class': flattenTypedName,
  'classdesc': prop('description'),
  'const': synonym('constant'),
  'constant': flattenTypedName,
  'constructor': synonym('class'),
  'constructs': todo,
  'copyright': prop('description'),
  'default': todo,
  'defaultvalue': synonym('default'),
  'deprecated': prop('description'),
  'desc': synonym('description'),
  'description': prop('description'),
  'emits': synonym('fires'),
  'enum': todo,
  'event': prop('description'),
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
      example.caption = tag.caption;
    }

    result.examples.push(example);
  },
  'exception': synonym('throws'),
  'exports': todo,
  'extends': synonym('augments'),
  'external': prop('description'),
  'file': prop('description'),
  'fileoverview': synonym('file'),
  'fires': todo,
  'func': synonym('function'),
  'function': prop('name'),
  'global': propKey('title', 'scope'),
  'host': synonym('external'),
  'ignore': flattenBoolean,
  'implements': todo,
  'inheritdoc': todo,
  'inner': propKey('title', 'scope'),
  'instance': propKey('title', 'scope'),
  'interface': function (result, tag) {
    result.interface = true;
    if (tag.description) {
      result.name = tag.description;
    }
  },
  'kind': propKey('kind', 'kind'),
  'lends': prop('description'),
  'license': prop('description'),
  'linkcode': synonym('link'),
  'linkplain': synonym('link'),
  'listens': todo,
  'member': flattenTypedName,
  'memberof': prop('description'),
  'method': synonym('function'),
  'mixes': todo,
  'mixin': prop('name'),
  'module': flattenTypedName,
  'name': prop('name'),
  'namespace': flattenTypedName,
  'override': flattenBoolean,
  'overview': synonym('file'),
  'param': collect('params'),
  'private': propKey('title', 'access'),
  'prop': synonym('property'),
  'property': collect('properties'),
  'protected': propKey('title', 'access'),
  'public': propKey('title', 'access'),
  'readonly': flattenBoolean,
  'requires': todo,
  'return': synonym('returns'),
  'returns': collect('returns'),
  'see': collect('sees', true),
  'since': prop('description'),
  'static': propKey('title', 'scope'),
  'summary': prop('description'),
  'this': todo,
  'throws': collect('throws'),
  'todo': collect('todos', true),
  'tutorial': todo,
  'type': todo,
  'typedef': flattenTypedName,
  'var': synonym('member'),
  'variation': propKey('variation', 'variation'),
  'version': prop('description'),
  'virtual': synonym('abstract')
};

function todo() {}

function collect(key, description) {
  function flattenCollect(result, tag) {
    if (!result[key]) {
      result[key] = [];
    }
    if (description) {
      result[key].push(tag.description);
    } else {
      result[key].push(tag);
    }
  }
  return flattenCollect;
}

function synonym(key) {
  function flattenSynonym(result, tag) {
    return flatteners[key](result, tag, key);
  }
  flattenSynonym.synonym = 'key';
  return flattenSynonym;
}

function flattenBoolean(result, tag, key) {
  result[key] = true;
}
flattenBoolean.singleUse = true;

function prop(prop) {
  function flattenProp(result, tag, key) {
    result[key] = tag[prop];
  }
  flattenProp.singleUse = true;
  return flattenProp;
}

function propKey(prop, key) {
  function flattenPropKey(result, tag) {
    result[key] = tag[prop];
  }
  flattenPropKey.singleUse = true;
  flattenPropKey.synonym = key;
  return flattenPropKey;
}

function flattenTypedName(result, tag, key) {
  result[key] = {
    name: tag.name
  };

  if (tag.type) {
    result[key].type = tag.type;
  }
}

module.exports = flatteners;
