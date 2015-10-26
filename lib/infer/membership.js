'use strict';

var types = require('ast-types'),
  pathParse = require('parse-filepath'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

var n = types.namedTypes;

function findLendsIdentifiers(node) {
  if (!node || !node.leadingComments) {
    return;
  }

  for (var i = 0; i < node.leadingComments.length; i++) {
    var comment = node.leadingComments[i];
    if (isJSDocComment(comment)) {
      var lends = parse(comment.value).lends;
      if (lends) {
        return lends.split('.');
      }
    }
  }
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
  var identifiers = [];

  types.visit(path, {
    visitNode: function () {
      return false;
    },

    visitAssignmentExpression: function (path) {
      this.traverse(path);
    },

    visitMemberExpression: function (path) {
      this.traverse(path);
    },

    visitIdentifier: function (path) {
      identifiers.push(path.node.name);
      return false;
    }
  });

  return identifiers;
}

/**
 * Count leading identifiers that refer to a module export (`exports` or `module.exports`).
 * @param {Object} comment parsed comment
 * @param {Array<string>} identifiers array of identifier names
 * @returns {number} number of identifiers referring to a module export (0, 1 or 2)
 */
function countModuleIdentifiers(comment, identifiers) {
  if (identifiers.length >= 1 && identifiers[0] === 'exports') {
    return 1;
  }

  if (identifiers.length >= 2 && identifiers[0] === 'module' && identifiers[1] === 'exports') {
    return 2;
  }

  return 0;
}

/**
 * Uses code structure to infer `memberof`, `instance`, and `static`
 * tags from the placement of JSDoc
 * annotations within a file
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with membership inferred
 */
module.exports = function () {
  var currentModule;

  function inferModuleName(comment) {
    return (comment.module && comment.module.name) ||
      pathParse(comment.context.file).name;
  }

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
   * @returns {undefined} mutates `comment`
   * @private
   */
  function inferMembershipFromIdentifiers(comment, identifiers, explicitScope) {
    if (identifiers.length === 1 && identifiers[0] === 'module' && comment.name === 'exports') {
      comment.name = inferModuleName(currentModule || comment);
      return;
    }

    /*
     * Test whether identifiers start with a module export (`exports` or `module.exports`),
     * and if so replace those identifiers with the name of the current module.
     */
    var moduleIdentifierCount = countModuleIdentifiers(comment, identifiers);
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
  }

  return function inferMembership(comment) {
    if (comment.module) {
      currentModule = comment;
    }

    if (comment.lends) {
      return;
    }

    if (comment.memberof) {
      return comment;
    }

    var path = comment.context.ast;
    var identifiers;

    /*
     * Deal with an oddity of espree: the jsdoc comment is attached to a different
     * node in the two expressions `a.b = c` vs `a.b = function () {}`.
     */
    if (n.ExpressionStatement.check(path.node) &&
        n.AssignmentExpression.check(path.node.expression) &&
        n.MemberExpression.check(path.node.expression.left)) {
      path = path.get('expression').get('left');
    }

    /*
     * Same as above but for `b: c` vs `b: function () {}`.
     */
    if (n.Property.check(path.node) &&
        n.Identifier.check(path.node.key)) {
      path = path.get('key');
    }

    // Foo.bar = ...;
    // Foo.prototype.bar = ...;
    // Foo.bar.baz = ...;
    if (n.MemberExpression.check(path.node)) {
      identifiers = extractIdentifiers(path);
      if (identifiers.length >= 2) {
        inferMembershipFromIdentifiers(comment, identifiers.slice(0, -1));
      }
    }

    // /** @lends Foo */{ bar: ... }
    if (n.Identifier.check(path.node) &&
      n.Property.check(path.parent.node) &&
      n.ObjectExpression.check(path.parent.parent.node)) {
      // The @lends comment is sometimes attached to the first property rather than
      // the object expression itself.
      identifiers = findLendsIdentifiers(path.parent.parent.node) ||
          findLendsIdentifiers(path.parent.parent.node.properties[0]);
      if (identifiers) {
        inferMembershipFromIdentifiers(comment, identifiers);
      }
    }

    // Foo = { bar: ... };
    // Foo.prototype = { bar: ... };
    // Foo.bar = { baz: ... };
    if (n.Identifier.check(path.node) &&
        n.Property.check(path.parent.node) &&
        n.ObjectExpression.check(path.parent.parent.node) &&
        n.AssignmentExpression.check(path.parent.parent.parent.node)) {
      identifiers = extractIdentifiers(path.parent.parent.parent);
      if (identifiers.length >= 1) {
        inferMembershipFromIdentifiers(comment, identifiers);
      }
    }

    // var Foo = { bar: ... }
    if (n.Identifier.check(path.node) &&
        n.Property.check(path.parent.node) &&
        n.ObjectExpression.check(path.parent.parent.node) &&
        n.VariableDeclarator.check(path.parent.parent.parent.node)) {
      identifiers = [path.parent.parent.parent.node.id.name];
      inferMembershipFromIdentifiers(comment, identifiers);
    }

    // class Foo { bar() { } }
    if (n.MethodDefinition.check(path.node) &&
        n.ClassBody.check(path.parent.node) &&
        n.ClassDeclaration.check(path.parent.parent.node)) {
      identifiers = [path.parent.parent.node.id.name];
      var scope = 'instance';
      if (path.node.static == true) {
        scope = 'static';
      }
      inferMembershipFromIdentifiers(comment, identifiers, scope);
    }

    return comment;
  };
}
