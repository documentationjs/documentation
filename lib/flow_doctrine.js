var namedTypes = {
  'NumberTypeAnnotation': 'number',
  'BooleanTypeAnnotation': 'boolean',
  'ObjectTypeAnnotation': 'Object',
  'StringTypeAnnotation': 'string'
};

var oneToOne = {
  'AnyTypeAnnotation': 'AllLiteral',
  'NullLiteralTypeAnnotation': 'NullLiteral',
  'VoidTypeAnnotation': 'VoidLiteral'
};

var literalTypes = {
  'BooleanLiteralTypeAnnotation': 'BooleanLiteral',
  'NumericLiteralTypeAnnotation': 'NumberLiteral',
  'StringLiteralTypeAnnotation': 'StringLiteral'
};

/**
 * Babel parses Flow annotations in JavaScript into AST nodes. documentation.js uses
 * Babel to parse JavaScript. This method restructures those Babel-generated
 * objects into objects that fit the output of Doctrine, the module we use
 * to parse JSDoc annotations. This lets us use Flow annotations _as_
 * JSDoc annotations.
 *
 * @private
 * @param {Object} type babel-parsed flow type
 * @returns {Object} doctrine compatible type
 */
function flowDoctrine(type) {
  if (type.type in namedTypes) {
    return {
      type: 'NameExpression',
      name: namedTypes[type.type]
    };
  }

  if (type.type in oneToOne) {
    return {type: oneToOne[type.type]};
  }

  switch (type.type) {
  case 'NullableTypeAnnotation':
    return {
      type: 'NullableType',
      expression: flowDoctrine(type.typeAnnotation)
    };
  case 'UnionTypeAnnotation':
    return {
      type: 'UnionType',
      elements: type.types.map(flowDoctrine)
    };

  // [number]
  // [string, boolean, number]
  case 'TupleTypeAnnotation':
    return {
      type: 'ArrayType',
      elements: type.types.map(flowDoctrine)
    };

  // number[]
  case 'ArrayTypeAnnotation':
    return {
      type: 'TypeApplication',
      expression: {
        type: 'NameExpression',
        name: 'Array'
      },
      applications: [flowDoctrine(type.elementType)]
    };

  case 'GenericTypeAnnotation':
    if (type.typeParameters) {
      return {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: type.id.name
        },
        applications: type.typeParameters.params.map(flowDoctrine)
      };
    }

    return {
      type: 'NameExpression',
      name: type.id.name
    };
  }

  if (type.type in literalTypes) {
    return {
      type: literalTypes[type.type],
      name: type.value
    };
  }
}

module.exports = flowDoctrine;
