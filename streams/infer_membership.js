'use strict';

var through = require('through'),
  types = require('ast-types'),
  n = types.namedTypes;

/**
 * Create a transform stream that uses code structure to infer
 * `memberof`, `instance`, and `static` tags from the placement of JSDoc
 * annotations within a file
 *
 * @name inferMembership
 * @returns {Stream.Transform} stream
 */
module.exports = function () {
  return through(function (comment) {
    if (comment.tags.some(function (tag) {
      return tag.title === 'memberof';
    })) {
      this.push(comment);
      return;
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
     * Set `memberof` and `instance`/`static` tags on `comment` based on the
     * array of `identifiers`. If the last element of the `identifiers` is
     * `"prototype"`, it is assumed to be an instance member; otherwise static.
     *
     * @param {Array<string>} identifiers
     * @returns {undefined} mutates `comment`
     * @private
     */
    function inferMembership(identifiers) {
      if (identifiers[identifiers.length - 1] === 'prototype') {
        comment.tags.push({
          title: 'memberof',
          description: identifiers.slice(0, -1).join('.')
        });

        comment.tags.push({
          title: 'instance'
        });
      } else {
        comment.tags.push({
          title: 'memberof',
          description: identifiers.join('.')
        });

        comment.tags.push({
          title: 'static'
        });
      }
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

    /*
     * Foo.bar = ...;
     * Foo.prototype.bar = ...;
     * Foo.bar.baz = ...;
     */
    if (n.MemberExpression.check(path.node)) {
      identifiers = extractIdentifiers(path);
      if (identifiers.length >= 2) {
        inferMembership(identifiers.slice(0, -1));
      }
    }

    /*
     * Foo = { bar: ... };
     * Foo.prototype = { bar: ... };
     * Foo.bar = { baz: ... };
     */
    if (n.Identifier.check(path.node) &&
        n.Property.check(path.parent.node) &&
        n.ObjectExpression.check(path.parent.parent.node) &&
        n.AssignmentExpression.check(path.parent.parent.parent.node)) {
      identifiers = extractIdentifiers(path.parent.parent.parent);
      if (identifiers.length >= 1) {
        inferMembership(identifiers);
      }
    }

    /*
     * var Foo = { bar: ... }
     */
    if (n.Identifier.check(path.node) &&
        n.Property.check(path.parent.node) &&
        n.ObjectExpression.check(path.parent.parent.node) &&
        n.VariableDeclarator.check(path.parent.parent.parent.node)) {
      identifiers = [path.parent.parent.parent.node.id.name];
      inferMembership(identifiers);
    }

    this.push(comment);
  });
};
