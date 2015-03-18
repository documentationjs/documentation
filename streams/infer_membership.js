'use strict';

var through = require('through'),
  types = require('ast-types');

module.exports = function () {
  return through(function (comment) {
    if (comment.tags.some(function (tag) { return tag.title === 'memberof'; })) {
      this.push(comment);
      return;
    }

    var identifiers = [];

    types.visit(comment.context.ast, {
      visitNode: function (path) {
        return false;
      },

      visitExpressionStatement: function (path) {
        this.traverse(path);
      },

      visitAssignmentExpression: function (path) {
        this.traverse(path);
      },

      visitMemberExpression: function (path) {
        this.traverse(path);
      },

      visitIdentifier: function (path) {
        identifiers.push(path.value.name);
        return false;
      },
    });

    if (identifiers.length >= 2) {
      if (identifiers[identifiers.length - 2] === 'prototype') {
        comment.tags.push({
          title: 'memberof',
          description: identifiers.slice(0, -2).join('.')
        });

        comment.tags.push({
          title: 'instance'
        });
      } else {
        comment.tags.push({
          title: 'memberof',
          description: identifiers.slice(0, -1).join('.')
        });

        comment.tags.push({
          title: 'static'
        });
      }
    }

    this.push(comment);
  });
};
