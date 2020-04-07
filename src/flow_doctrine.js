const generate = require('@babel/generator').default;

const namedTypes = {
  NumberTypeAnnotation: 'number',
  BooleanTypeAnnotation: 'boolean',
  StringTypeAnnotation: 'string',
  SymbolTypeAnnotation: 'symbol'
};

const oneToOne = {
  AnyTypeAnnotation: 'AllLiteral',
  MixedTypeAnnotation: 'AllLiteral',
  NullLiteralTypeAnnotation: 'NullLiteral',
  VoidTypeAnnotation: 'VoidLiteral'
};

function propertyToField(property) {
  if (!property.value) return null;

  let type = flowDoctrine(property.value);
  if (property.optional) {
    // Doctrine does not support optional fields but it does have something called optional types
    // (which makes no sense, but let's play along).
    type = {
      type: 'OptionalType',
      expression: type
    };
  }
  return {
    type: 'FieldType',
    key: property.key.name || property.key.value,
    value: type
  };
}

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
    const doctrineType = {
      type: 'NameExpression',
      name: namedTypes[type.type]
    };
    return doctrineType;
  }

  if (type.type in oneToOne) {
    return { type: oneToOne[type.type] };
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
    // (y: number) => bool
    case 'FunctionTypeAnnotation':
      return {
        type: 'FunctionType',
        params: type.params.map(param => {
          let name = '';
          if (param.name && param.name.name) {
            name = param.name.name;
          }
          return {
            type: 'ParameterType',
            name,
            expression: flowDoctrine(param.typeAnnotation)
          };
        }),
        result: flowDoctrine(type.returnType)
      };

    case 'GenericTypeAnnotation':
      if (type.typeParameters) {
        return {
          type: 'TypeApplication',
          expression: {
            type: 'NameExpression',
            name: generate(type.id, {
              compact: true
            }).code
          },
          applications: type.typeParameters.params.map(flowDoctrine)
        };
      }

      return {
        type: 'NameExpression',
        name: generate(type.id, {
          compact: true
        }).code
      };

    case 'ObjectTypeAnnotation':
      if (type.properties) {
        return {
          type: 'RecordType',
          fields: type.properties.map(propertyToField).filter(x => x)
        };
      }

      return {
        type: 'NameExpression',
        name: generate(type.id, {
          compact: true
        }).code
      };
    case 'BooleanLiteralTypeAnnotation':
      return {
        type: 'BooleanLiteralType',
        value: type.value
      };
    case 'NumberLiteralTypeAnnotation':
      return {
        type: 'NumericLiteralType',
        value: type.value
      };
    case 'StringLiteralTypeAnnotation':
      return {
        type: 'StringLiteralType',
        value: type.value
      };
    case 'ThisTypeAnnotation':
      return {
        type: 'NameExpression',
        name: 'this'
      };
    default:
      return {
        type: 'AllLiteral'
      };
  }
}

module.exports = flowDoctrine;
