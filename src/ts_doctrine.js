const generate = require('@babel/generator').default;

const namedTypes = {
  TSBigIntKeyword: 'bigint',
  TSNumberKeyword: 'number',
  TSBooleanKeyword: 'boolean',
  TSStringKeyword: 'string',
  TSSymbolKeyword: 'symbol',
  TSThisType: 'this',
  TSObjectKeyword: 'object',
  TSNeverKeyword: 'never'
};

const oneToOne = {
  TSAnyKeyword: 'AllLiteral',
  TSUnknownKeyword: 'AllLiteral',
  TSNullKeyword: 'NullLiteral',
  TSUndefinedKeyword: 'UndefinedLiteral',
  TSVoidKeyword: 'VoidLiteral'
};

function propertyToField(property) {
  if (!property.typeAnnotation) return null;

  let type = tsDoctrine(property.typeAnnotation.typeAnnotation);
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
    key: property.key ? property.key.name || property.key.value : '',
    value: type
  };
}

/**
 * Babel parses TypeScript annotations in JavaScript into AST nodes. documentation.js uses
 * Babel to parse TypeScript. This method restructures those Babel-generated
 * objects into objects that fit the output of Doctrine, the module we use
 * to parse JSDoc annotations. This lets us use TypeScript annotations _as_
 * JSDoc annotations.
 *
 * @private
 * @param {Object} type babel-parsed typescript type
 * @returns {Object} doctrine compatible type
 */
function tsDoctrine(type) {
  if (type.type in namedTypes) {
    const doctrineType = {
      type: 'NameExpression',
      name: namedTypes[type.type]
    };
    return doctrineType;
  }

  // TODO: unhandled types
  // TSIntersectionType, TSConditionalType, TSInferType, TSTypeOperator, TSIndexedAccessType
  // TSMappedType, TSImportType, TSTypePredicate, TSTypeQuery, TSExpressionWithTypeArguments

  if (type.type in oneToOne) {
    return { type: oneToOne[type.type] };
  }

  switch (type.type) {
    case 'TSOptionalType':
      return {
        type: 'NullableType',
        expression: tsDoctrine(type.typeAnnotation)
      };
    case 'TSParenthesizedType':
      return tsDoctrine(type.typeAnnotation);
    case 'TSUnionType':
      return {
        type: 'UnionType',
        elements: type.types.map(tsDoctrine)
      };
    // [number]
    // [string, boolean, number]
    case 'TSTupleType':
      return {
        type: 'ArrayType',
        elements: type.elementTypes.map(tsDoctrine)
      };
    // number[]
    case 'TSArrayType':
      return {
        type: 'TypeApplication',
        expression: {
          type: 'NameExpression',
          name: 'Array'
        },
        applications: [tsDoctrine(type.elementType)]
      };
    // ...string
    case 'TSRestType':
      return {
        type: 'RestType',
        expression: tsDoctrine(type.typeAnnotation)
      };
    // (y: number) => bool
    case 'TSFunctionType':
    case 'TSConstructorType':
    case 'TSMethodSignature':
      return {
        type: 'FunctionType',
        params: type.parameters.map(param => {
          if (param.type === 'RestElement') {
            return {
              type: 'RestType',
              expression: {
                type: 'ParameterType',
                name: param.argument.name,
                expression: tsDoctrine(param.typeAnnotation.typeAnnotation)
              }
            };
          }

          return {
            type: 'ParameterType',
            name: param.name,
            expression: tsDoctrine(param.typeAnnotation.typeAnnotation)
          };
        }),
        result: tsDoctrine(type.typeAnnotation.typeAnnotation)
      };

    case 'TSTypeReference':
      if (type.typeParameters) {
        return {
          type: 'TypeApplication',
          expression: {
            type: 'NameExpression',
            name: generate(type.typeName, {
              compact: true
            }).code
          },
          applications: type.typeParameters.params.map(tsDoctrine)
        };
      }

      return {
        type: 'NameExpression',
        name: generate(type.typeName, {
          compact: true
        }).code
      };

    case 'TSTypeLiteral':
      if (type.members) {
        return {
          type: 'RecordType',
          fields: type.members.map(propertyToField).filter(x => x)
        };
      }

      return {
        type: 'NameExpression',
        name: generate(type.id, {
          compact: true
        }).code
      };
    case 'TSLiteralType':
      return {
        type: `${type.literal.type}Type`,
        value: type.literal.value
      };
    default:
      return {
        type: 'AllLiteral'
      };
  }
}

module.exports = tsDoctrine;
