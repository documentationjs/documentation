'use strict';

var walk = require('../../lib/walk');

describe('walk', function () {

  it('flat comments', function () {
    var comments = [{ name: 'Tom' }];

    function renamer(comment, options) {
      if (options) {
        comment.name = options.name;
      } else {
        comment.name = 'Tim';
      }
    }

    expect(walk(comments, renamer)).toEqual([
      { name: 'Tim' }
    ]);

    expect(walk(comments, renamer, { name: 'John' })).toEqual([
      { name: 'John' }
    ]);
  });

  it('nested comments', function () {
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

    expect(walk(comments, renamer)).toEqual([{
      name: 'Tim',
      members: {
        static: [{
          name: 'Tim'
        }]
      }
    }]);

    expect(walk(comments, renamer, {
      name: 'Bob'
    })).toEqual([{
      name: 'Bob',
      members: {
        static: [{
          name: 'Bob'
        }]
      }
    }]);
  });
});
