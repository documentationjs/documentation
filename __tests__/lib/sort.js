const sort = require('../../src/sort');
const path = require('path');

test('sort stream alphanumeric', function () {
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const banana = { context: { sortKey: 'c' }, name: 'bananas' };

  expect(sort([apples, carrot, banana])).toEqual([apples, carrot, banana]);

  expect(sort([carrot, apples, banana])).toEqual([apples, carrot, banana]);
});

test('sort stream with configuration', function () {
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  expect(
    sort([apples, carrot, bananas], {
      toc: ['carrot', 'bananas']
    })
  ).toEqual([carrot, bananas, apples]);
});

test('sort stream with configuration and a section', function () {
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  const section = {
    name: 'This is the banana type',
    description: 'here lies bananas'
  };

  const sectionMarkdown = {
    name: 'This is the banana type',
    description: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'here lies bananas'
            }
          ]
        }
      ]
    },
    kind: 'note',
    path: [
      {
        name: 'This is the banana type',
        scope: 'static'
      }
    ]
  };

  expect(
    sort([apples, carrot, bananas], {
      toc: ['carrot', section, 'bananas']
    })
  ).toEqual([carrot, sectionMarkdown, bananas, apples]);
});

test('sort an already-sorted stream containing a section/description', function () {
  // this happens in the 'serve' task
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  const section = {
    name: 'This is the banana type',
    description: 'here lies bananas'
  };
  const sectionMarkdown = {
    name: 'This is the banana type',
    description: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'here lies bananas'
            }
          ]
        }
      ]
    },
    kind: 'note',
    path: [
      {
        name: 'This is the banana type',
        scope: 'static'
      }
    ]
  };

  const config = {
    toc: ['carrot', section, 'bananas']
  };

  const sortOnce = sort([apples, carrot, bananas], config);
  const sortTwice = sort(sortOnce, config);
  expect(sortTwice).toEqual([carrot, sectionMarkdown, bananas, apples]);
});

test('sort toc with files', function () {
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  const snowflake = {
    name: 'snowflake',
    file: path.join(__dirname, '../fixture/snowflake.md')
  };

  expect(
    sort([apples, carrot, bananas], {
      toc: [snowflake]
    })
  ).toMatchSnapshot();
});

test('sort toc with files absolute path', function () {
  const apples = { context: { sortKey: 'a' }, name: 'apples' };
  const carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  const bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  const snowflake = {
    name: 'snowflake',
    file: path.join(__dirname, '../fixture/snowflake.md')
  };
  expect(
    sort([apples, carrot, bananas], {
      toc: [snowflake]
    })
  ).toMatchSnapshot();
});

test('sort toc with files absolute path', function () {
  const apples = {
    context: { sortKey: 'a' },
    name: 'apples',
    memberof: 'classB'
  };
  const carrot = {
    context: { sortKey: 'b' },
    name: 'carrot',
    memberof: 'classB'
  };
  const bananas = {
    context: { sortKey: 'c' },
    name: 'bananas',
    memberof: 'classB'
  };

  const snowflake = {
    name: 'snowflake',
    file: path.join(__dirname, '../fixture/snowflake.md')
  };
  expect(
    sort([carrot, apples, bananas], {
      sortOrder: 'alpha'
    })
  ).toMatchSnapshot();
});
