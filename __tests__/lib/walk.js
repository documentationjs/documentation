var walk = require('../../src/walk');

test('walk', function() {
  test('flat comments', function(t) {
    var comments = [{ name: 'Tom' }];

    function renamer(comment, options) {
      if (options) {
        comment.name = options.name;
      } else {
        comment.name = 'Tim';
      }
    }

    expect(walk(comments, renamer)).toEqual([{ name: 'Tim' }]);

    expect(walk(comments, renamer, { name: 'John' })).toEqual([
      { name: 'John' }
    ]);
  });

  test('nested comments', function(t) {
    var comments = [
      {
        name: 'Tom',
        members: {
          static: [
            {
              name: 'Billy'
            }
          ]
        }
      }
    ];

    function renamer(comment, options) {
      if (options) {
        comment.name = options.name;
      } else {
        comment.name = 'Tim';
      }
    }

    expect(walk(comments, renamer)).toEqual([
      {
        name: 'Tim',
        members: {
          static: [
            {
              name: 'Tim'
            }
          ]
        }
      }
    ]);

    expect(
      walk(comments, renamer, {
        name: 'Bob'
      })
    ).toEqual([
      {
        name: 'Bob',
        members: {
          static: [
            {
              name: 'Bob'
            }
          ]
        }
      }
    ]);
  });
});
