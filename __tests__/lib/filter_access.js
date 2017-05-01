var filterAccess = require('../../src/filter_access');

test('filterAccess ignore', function() {
  expect(
    filterAccess(
      ['public', 'protected', 'undefined'],
      [
        {
          access: 'public',
          ignore: true
        }
      ]
    )
  ).toEqual([]);
});

test('filterAccess public, protected, undefined, no private', function() {
  expect(
    filterAccess(
      ['public', 'protected', 'undefined'],
      [
        {
          access: 'public'
        },
        {
          access: 'protected'
        },
        {
          foo: 2
        },
        {
          access: 'private'
        }
      ]
    )
  ).toEqual([
    {
      access: 'public'
    },
    {
      access: 'protected'
    },
    {
      foo: 2
    }
  ]);
});

test('filterAccess explicit public', function() {
  expect(
    filterAccess(
      ['public'],
      [
        { access: 'public' },
        { access: 'protected' },
        { foo: 2 },
        { access: 'private' }
      ]
    )
  ).toEqual([
    {
      access: 'public'
    }
  ]);
});

test('filterAccess override', function() {
  expect(
    filterAccess(
      ['private'],
      [
        {
          access: 'private'
        }
      ]
    )
  ).toEqual([
    {
      access: 'private'
    }
  ]);
});

test('filterAccess nesting', function() {
  expect(
    filterAccess(
      ['public', 'protected', 'undefined'],
      [
        {
          access: 'public',
          members: {
            static: [
              {
                access: 'public'
              },
              {
                access: 'private'
              }
            ]
          }
        },
        {
          access: 'private',
          members: {
            static: [
              {
                access: 'public'
              },
              {
                access: 'private'
              }
            ]
          }
        }
      ]
    )
  ).toEqual([
    {
      access: 'public',
      members: {
        static: [
          {
            access: 'public'
          }
        ]
      }
    }
  ]);
});
