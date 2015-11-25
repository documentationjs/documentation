'use strict';

var test = require('tap').test,
  walk = require('../../lib/walk');

test('walk', function (group) {

  group.test('flat comments', function (t) {

    var comments = [{ name: 'Tom' }];

    function renamer(comment, options) {
      if (options) {
        comment.name = options.name;
      } else {
        comment.name = 'Tim';
      }
    }

    t.deepEqual(walk(comments, renamer), [
      { name: 'Tim' }
    ], 'no-option case');

    t.deepEqual(walk(comments, renamer, { name: 'John' }), [
      { name: 'John' }
    ], 'with options');

    t.end();
  });

  group.test('nested comments', function (t) {

    var comments = [{
      name: 'Tom',
      members: {
        static: [{
          name: 'Billy'
        }]
      }
    }];

    function renamer(comment, options) {
      if (options) {
        comment.name = options.name;
      } else {
        comment.name = 'Tim';
      }
    }

    t.deepEqual(walk(comments, renamer), [{
      name: 'Tim',
      members: {
        static: [{
          name: 'Tim'
        }]
      }
    }], 'no-option case');

    t.deepEqual(walk(comments, renamer, {
      name: 'Bob'
    }), [{
      name: 'Bob',
      members: {
        static: [{
          name: 'Bob'
        }]
      }
    }], 'with options');

    t.end();
  });

  group.end();
});
