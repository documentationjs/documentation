const n = require('@babel/types');
const pathParse = require('parse-filepath');
const isJSDocComment = require('../is_jsdoc_comment');
const parse = require('../parse');

function inferModuleName(comment) {
  return (
    (comment.kind === 'module' && comment.name) ||
    pathParse(comment.context.file).name
  );
}

/**
 * Given an AST node, try to find a comment in front of it that
 * has a `lends` tag, and if it has that, return the tag, split by
 * .s.
 *
 * @private
 * @param {Object} path AST node
 * @returns {string|undefined} lends identifier, if any
 */
function findLendsIdentifiers(path) {
  if (!path || !path.get('leadingComments')) {
    return;
  }

  const leadingComments = path.get('leadingComments');

  for (let i = 0; i < leadingComments.length; i++) {
    const comment = leadingComments[i];
    if (isJSDocComment(comment.node)) {
      const lends = parse(comment.node.value).lends;
      if (lends) {
        return lends.split('.');
      }
    }
  }
}

/**
 * Given an AST node, try to find a comment before the class declaration that
 * has a `memberof` tag, and if it has that, return the tag, split by
 * .s with the name of the class.
 *
 * @private
 * @param {Object} path AST node
 * @returns {Array<string>} class membership
 */
function inferClassMembership(path) {
  if (path.get('leadingComments')) {
    const leadingComments = path.get('leadingComments');

    for (let i = leadingComments.length - 1; i >= 0; i--) {
      const comment = leadingComments[i];
      if (isJSDocComment(comment.node)) {
        const memberof = parse(comment.node.value).memberof;
        if (memberof) {
          return [...memberof.split('.'), path.node.id.name];
        }
      }
    }
  }

  return [path.node.id.name];
}

/**
 * Extract and return the identifiers for expressions of
 * type this.foo
 *
 * @param {NodePath} path AssignmentExpression, MemberExpression,
 * or Identifier
 * @param {Comment} comment
 * @returns {Array<string>} identifiers
 * @private
 */
function extractThis(path, comment) {
  let identifiers = [];

  path.traverse({
    /**
     * Add the resolved identifier of this in a path to the identifiers array
     * @param {Object} path ast path
     * @returns {undefined} has side-effects
     * @private
     */
    ThisExpression(path) {
      let scope = path.scope;

      while (n.isBlockStatement(scope.block)) {
        scope = scope.parent;
      }

      if (n.isClassMethod(scope.block)) {
        identifiers.push(
          scope.path.parentPath.parentPath.node.id.name,
          'prototype'
        );
      }

      // function OldClass() { this.foo = 1 }
      if (n.isFunctionDeclaration(scope.block)) {
        // named function like
        // function OldClass() { ... }
        if (scope.block.id) {
          identifiers.push(scope.block.id.name, 'prototype');
        } else if (n.isExportDefaultDeclaration(path.scope.parentBlock)) {
          identifiers.push(inferModuleName(comment));
        }
        // var Binding = function OldClass() { this.foo = 1 }
      } else if (n.isFunctionExpression(scope.block)) {
        if (scope.path.parentPath.isVariableDeclarator()) {
          /** var Bar = function(foo) { this.foo = foo; }; */
          identifiers = identifiers
            .concat(scope.path.parentPath.get('id').node.name)
            .concat('prototype');
        } else if (scope.path.parentPath.isAssignmentExpression()) {
          /** this.Bar = function(foo) { this.foo = foo; }; */
          identifiers = identifiers
            .concat(extractIdentifiers(scope.path.parentPath.get('left')))
            .concat('prototype');
        }
      }
    }
  });

  return identifiers;
}

/**
 * Extract and return the chain of identifiers from the left hand side of expressions
 * of the forms `Foo = ...`, `Foo.bar = ...`, `Foo.bar.baz = ...`, etc.
 *
 * @param {NodePath} path AssignmentExpression, MemberExpression, or Identifier
 * @returns {Array<string>} identifiers
 * @private
 */
function extractIdentifiers(path) {
  const identifiers = [];

  path.traverse({
    /**
     * Add an identifier in a path to the identifiers array
     * @param {Object} path ast path
     * @returns {undefined} has side-effects
     * @private
     */
    Identifier(path) {
      identifiers.push(path.node.name);
    }
  });

  return identifiers;
}

/**
 * Count leading identifiers that refer to a module export (`exports` or `module.exports`).
 * @private
 * @param {Object} comment parsed comment
 * @param {Array<string>} identifiers array of identifier names
 * @returns {number} number of identifiers referring to a module export (0, 1 or 2)
 */
function countModuleIdentifiers(comment, identifiers) {
  if (identifiers.length >= 1 && identifiers[0] === 'exports') {
    return 1;
  }

  if (
    identifiers.length >= 2 &&
    identifiers[0] === 'module' &&
    identifiers[1] === 'exports'
  ) {
    return 2;
  }

  return 0;
}

/**
 * Returns the comment object after normalizing Foo.prototype and Foo# expressions
 * @param comment parsed comment
 * @returns the normalized comment
 */
function normalizeMemberof(comment) {
  if (typeof comment.memberof != 'string') {
    return comment;
  }

  const memberof = comment.memberof;

  const isPrototype = /.prototype$/;

  if (memberof.match(isPrototype) !== null) {
    comment.memberof = memberof.replace(isPrototype, '');
    comment.scope = 'instance';

    return comment;
  }

  const isInstanceMember = /#$/;

  if (memberof.match(isInstanceMember) !== null) {
    comment.memberof = memberof.replace(isInstanceMember, '');
    comment.scope = 'instance';
  }

  return comment;
}

/**
 * Uses code structure to infer `memberof`, `instance`, and `static`
 * tags from the placement of JSDoc
 * annotations within a file
 *
 * @private
 * @returns {Object} comment with membership inferred
 */
module.exports = function () {
  let currentModule;

  /**
   * Set `memberof` and `instance`/`static` tags on `comment` based on the
   * array of `identifiers`. If the last element of the `identifiers` is
   * `"prototype"`, it is assumed to be an instance member; otherwise static.
   * If the `identifiers` start with `exports` or `module.exports`, assign
   * membership based on the last seen @module tag or name of the current file.
   *
   * @param {Object} comment comment for which to infer memberships
   * @param {Array<string>} identifiers array of identifier names
   * @param {string} explicitScope if derived from an es6 class, whether or
   * not this method had the static keyword
   * @returns {Comment} returns mutated `comment`
   * @private
   */
  function inferMembershipFromIdentifiers(comment, identifiers, explicitScope) {
    if (
      identifiers.length === 1 &&
      identifiers[0] === 'module' &&
      comment.name === 'exports'
    ) {
      comment.name = inferModuleName(currentModule || comment);
      return comment;
    }

    /*
     * Test whether identifiers start with a module export (`exports` or `module.exports`),
     * and if so replace those identifiers with the name of the current module.
     */
    const moduleIdentifierCount = countModuleIdentifiers(comment, identifiers);
    if (moduleIdentifierCount) {
      identifiers = identifiers.slice(moduleIdentifierCount);
      identifiers.unshift(inferModuleName(currentModule || comment));
    }

    if (identifiers[identifiers.length - 1] === 'prototype') {
      comment.memberof = identifiers.slice(0, -1).join('.');
      comment.scope = 'instance';
    } else {
      comment.memberof = identifiers.join('.');
      if (explicitScope !== undefined) {
        comment.scope = explicitScope;
      } else {
        comment.scope = 'static';
      }
    }
    return comment;
  }

  return function inferMembership(comment) {
    // Lends tags are go-betweens that let people reassign membership
    // in bulk: they themselves don't get an inference step
    if (comment.lends) {
      return comment;
    }

    if (comment.kind === 'module') {
      currentModule = comment;
    }

    // If someone explicitly specifies the parent of this chunk, don't
    // try to infer it, just return what they specified.
    if (comment.memberof) {
      return normalizeMemberof(comment);
    }

    let path = comment.context.ast;
    // If this chunk doesn't have code attached, like if it was the result
    // of a polyglot parse, don't try to infer anything.
    if (!path) {
      return comment;
    }

    // INFERENCE ===============================================================
    // Deal with an oddity of espree: the jsdoc comment is attached to a different
    // node in the two expressions `a.b = c` vs `a.b = function () {}`.
    if (
      path.isExpressionStatement() &&
      path.get('expression').isAssignmentExpression() &&
      path.get('expression').get('left').isMemberExpression()
    ) {
      path = path.get('expression').get('left');
    }

    // Same as above but for `b: c` vs `b: function () {}`.
    if (
      path.isObjectProperty() &&
      (path.get('key').isIdentifier() || path.get('key').isLiteral())
    ) {
      path = path.get('key');
    }

    // Forms:
    //
    // Foo.bar = ...;
    // Foo.prototype.bar = ...;
    // Foo.bar.baz = ...;
    //
    // Lends is not supported in this codepath.
    if (path.isMemberExpression()) {
      const memberIdentifiers = [].concat(
        extractThis(path, comment),
        extractIdentifiers(path)
      );
      if (memberIdentifiers.length >= 2) {
        return inferMembershipFromIdentifiers(
          comment,
          memberIdentifiers.slice(0, -1)
        );
      }
      return comment;
    }

    // Like straight membership, classes don't need
    // to support lends.
    //
    // class Foo { bar() { } }
    // var Foo = class { bar() { } }
    // class Foo { prop: T }
    // var Foo = class { prop: T }
    if (
      (path.isClassMethod() ||
        path.isClassProperty() ||
        path.isTSDeclareMethod()) &&
      path.parentPath.isClassBody() &&
      path.parentPath.parentPath.isClass()
    ) {
      let scope = 'instance';
      if (path.node.static == true) {
        scope = 'static';
      }

      if (path.parentPath.parentPath.isExpression()) {
        return inferMembershipFromIdentifiers(
          comment,
          extractIdentifiers(path.parentPath.parentPath.parentPath.get('left')),
          scope
        );
      }

      const declarationNode = path.parentPath.parentPath.node;
      if (!declarationNode.id && !declarationNode.key) {
        // export default function () {}
        // export default class {}
        // Use module name instead.
        return inferMembershipFromIdentifiers(
          comment,
          [pathParse(comment.context.file).name],
          scope
        );
      }

      return inferMembershipFromIdentifiers(
        comment,
        inferClassMembership(path.parentPath.parentPath),
        scope
      );
    }

    // Whether something is an ObjectMethod (shorthand like foo() {} )
    // or ObjectProperty (old fashioned like foo: function() {} )
    // doesn't matter for the membership phase, as long as we end up knowing
    // that it belongs to an object. So we first establish objectParent,
    // and then have the logic for the numerous ways an object can be named.
    let objectParent;

    if (
      (path.isIdentifier() || path.isLiteral()) &&
      path.parentPath.isObjectProperty() &&
      path.parentPath.parentPath.isObjectExpression()
    ) {
      objectParent = path.parentPath.parentPath;
    } else if (path.isObjectMethod() && path.parentPath.isObjectExpression()) {
      objectParent = path.parentPath;
    } else if (path.isObjectTypeProperty() || path.isTSTypeElement()) {
      objectParent = path.parentPath;
    }

    // Confirm that the thing being documented is a property of an object.
    if (objectParent) {
      // Collect all keys of parent nested object keys, e.g. {foo: bar: {baz: 1}}
      const objectKeys = [];

      while (!objectParent.isStatement()) {
        if (
          objectParent.isObjectProperty() ||
          objectParent.isObjectTypeProperty() ||
          objectParent.isTSPropertySignature()
        ) {
          objectKeys.unshift(objectParent.node.key.name);
        }

        // The @lends comment is sometimes attached to the first property rather than
        // the object expression itself.
        const lendsIdentifiers =
          findLendsIdentifiers(objectParent) ||
          findLendsIdentifiers(objectParent.get('properties')[0]);

        if (lendsIdentifiers) {
          return inferMembershipFromIdentifiers(comment, [
            ...lendsIdentifiers,
            ...objectKeys
          ]);
        } else if (objectParent.parentPath.isAssignmentExpression()) {
          // Foo = { ... };
          // Foo.prototype = { ... };
          // Foo.bar = { ... };
          return inferMembershipFromIdentifiers(comment, [
            ...extractIdentifiers(objectParent.parentPath.get('left')),
            ...objectKeys
          ]);
        } else if (objectParent.parentPath.isVariableDeclarator()) {
          // var Foo = { ... };
          return inferMembershipFromIdentifiers(comment, [
            objectParent.parentPath.get('id').node.name,
            ...objectKeys
          ]);
        } else if (objectParent.parentPath.isExportDefaultDeclaration()) {
          // export default { ... };
          return inferMembershipFromIdentifiers(comment, [
            inferModuleName(currentModule || comment),
            ...objectKeys
          ]);
        } else if (
          objectParent.parentPath.isTypeAlias() ||
          objectParent.parentPath.isTSTypeAliasDeclaration()
        ) {
          // type X = { ... }
          return inferMembershipFromIdentifiers(comment, [
            objectParent.parentPath.node.id.name,
            ...objectKeys
          ]);
        } else if (
          objectParent.parentPath.isInterfaceDeclaration() ||
          objectParent.parentPath.isTSInterfaceDeclaration()
        ) {
          // interface Foo { ... }
          return inferMembershipFromIdentifiers(
            comment,
            [...inferClassMembership(objectParent.parentPath), ...objectKeys],
            'instance'
          );
        }

        objectParent = objectParent.parentPath;
      }
    }

    // TypeScript enums
    // enum Foo { A }
    if (path.isTSEnumMember()) {
      const enumPath = path.parentPath;
      return inferMembershipFromIdentifiers(
        comment,
        [enumPath.node.id.name],
        'static'
      );
    }

    // var function Foo() {
    //   function bar() {}
    //   return { bar: bar };
    // }
    /*
    if (n.isFunctionDeclaration(path) &&
        n.isBlockStatement(path.parentPath) &&
        n.isFunction(path.parentPath.parentPath)) {
      inferMembershipFromIdentifiers(comment, [path.parentPath.parentPath.node.id.name]);
    }
    */

    return comment;
  };
};
