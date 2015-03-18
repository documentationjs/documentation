'use strict';

var through = require('through'),
  types = require('ast-types'),
  n = types.namedTypes;

module.exports = function () {
  return through(function (comment) {
    if (comment.tags.some(function (tag) { return tag.title === 'memberof'; })) {
      this.push(comment);
      return;
    }

    /*
     * Extract and return the chain of identifiers from the left hand side of expressions
     * of the forms `Foo = ...`, `Foo.bar = ...`, `Foo.bar.baz = ...`, etc.
     *
     * @param {NodePath} path AssignmentExpression, MemberExpression, or Identifier
     * @returns {Array<string>} identifiers
     */
    function extractIdentifiers(path) {
      var identifiers = [];

      types.visit(path, {
        visitNode: function() {
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
        },
      });

      return identifiers;
    }

    /*
     * Set `memberof` and `instance`/`static` tags on `comment` based on the
     * array of `identifiers`. If the last element of the `identifiers` is
     * `"prototype"`, it is assumed to be an instance member; otherwise static.
     *
     * @param {Array<string>} identifiers
     * @returns {undefined} mutates `comment`
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

    /*
     * Attempt to infer membership by traversing down the AST, looking for
     * expressions of the forms:
     *
     *   Foo.bar = baz;
     *   Foo.prototype.bar = baz;
     *   Foo.bar.baz = quux;
     *
     */
    types.visit(path, {
      visitNode: function() {
        return false;
      },

      visitExpressionStatement: function (path) {
        this.traverse(path);
      },

      visitAssignmentExpression: function(path) {
        this.traverse(path);
      },

      visitMemberExpression: function (path) {
        var identifiers = extractIdentifiers(path);

        if (identifiers.length >= 2) {
          inferMembership(identifiers.slice(0, -1));
        }

        return false;
      },

    });

    /*
     * Attempt to infer membership by traversing up the AST, looking for
     * expressions of the forms:
     *
     *   Foo = { ... };
     *   Foo.prototype = { ... };
     *   Foo.bar = { ... };
     *
     */
    if (n.Property.check(path.node) &&
      n.ObjectExpression.check(path.parent.node) &&
      n.AssignmentExpression.check(path.parent.parent.node)) {
      var identifiers = extractIdentifiers(path.parent.parent);

      if (identifiers.length >= 1) {
        inferMembership(identifiers);
      }
    }

    /*
     * Handle expressions of the form `var Foo = { ... }`.
     */
    if (n.Property.check(path.node) &&
      n.ObjectExpression.check(path.parent.node) &&
      n.VariableDeclarator.check(path.parent.parent.node)) {
      inferMembership([path.parent.parent.node.id.name]);
    }

    this.push(comment);
  });
};
