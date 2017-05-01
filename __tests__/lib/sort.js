var sort = require('../../src/sort'), path = require('path');

test('sort stream alphanumeric', function() {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var banana = { context: { sortKey: 'c' }, name: 'bananas' };

  expect(sort([apples, carrot, banana])).toEqual([apples, carrot, banana]);

  expect(sort([carrot, apples, banana])).toEqual([apples, carrot, banana]);
});

test('sort stream with configuration', function() {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  expect(
    sort([apples, carrot, bananas], {
      toc: ['carrot', 'bananas']
    })
  ).toEqual([carrot, bananas, apples]);
});

test('sort stream with configuration and a section', function() {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var section = {
    name: 'This is the banana type',
    description: 'here lies bananas'
  };

  var sectionMarkdown = {
    name: 'This is the banana type',
    description: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'here lies bananas',
              position: {
                start: {
                  line: 1,
                  column: 1,
                  offset: 0
                },
                end: {
                  line: 1,
                  column: 18,
                  offset: 17
                },
                indent: []
              }
            }
          ],
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0
            },
            end: {
              line: 1,
              column: 18,
              offset: 17
            },
            indent: []
          }
        }
      ],
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0
        },
        end: {
          line: 1,
          column: 18,
          offset: 17
        }
      }
    },
    kind: 'note'
  };

  expect(
    sort([apples, carrot, bananas], {
      toc: ['carrot', section, 'bananas']
    })
  ).toEqual([carrot, sectionMarkdown, bananas, apples]);
});

test('sort an already-sorted stream containing a section/description', function() {
  // this happens in the 'serve' task
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var section = {
    name: 'This is the banana type',
    description: 'here lies bananas'
  };
  var sectionMarkdown = {
    name: 'This is the banana type',
    description: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'here lies bananas',
              position: {
                start: {
                  line: 1,
                  column: 1,
                  offset: 0
                },
                end: {
                  line: 1,
                  column: 18,
                  offset: 17
                },
                indent: []
              }
            }
          ],
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0
            },
            end: {
              line: 1,
              column: 18,
              offset: 17
            },
            indent: []
          }
        }
      ],
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0
        },
        end: {
          line: 1,
          column: 18,
          offset: 17
        }
      }
    },
    kind: 'note'
  };

  var config = {
    toc: ['carrot', section, 'bananas']
  };

  var sortOnce = sort([apples, carrot, bananas], config);
  var sortTwice = sort(sortOnce, config);
  expect(sortTwice).toEqual([carrot, sectionMarkdown, bananas, apples]);
});

test('sort toc with files', function() {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var snowflake = {
    name: 'snowflake',
    file: 'test/fixture/snowflake.md'
  };

  expect(
    sort([apples, carrot, bananas], {
      toc: [snowflake]
    })
  ).toMatchSnapshot();
});

test('sort toc with files absolute path', function() {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var snowflake = {
    name: 'snowflake',
    file: path.join(__dirname, '../fixture/snowflake.md')
  };
  expect(
    sort([apples, carrot, bananas], {
      toc: [snowflake]
    })
  ).toMatchSnapshot();
});
