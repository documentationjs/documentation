'use strict';

var filterAccess = require('../../lib/filter_access');

it('filterAccess ignore', function () {
  expect(filterAccess(['public', 'protected', 'undefined'], [{
    access: 'public',
    ignore: true
  }])).toEqual([]);
});

it('filterAccess public, protected, undefined, no private', function () {
  expect(filterAccess(['public', 'protected', 'undefined'], [{
    access: 'public'
  }, {
    access: 'protected'
  }, {
    foo: 2
  }, {
    access: 'private'
  }])).toEqual([{
    access: 'public'
  }, {
    access: 'protected'
  }, {
    foo: 2
  }]);
});

it('filterAccess explicit public', function () {
  expect(filterAccess(['public'], [
    { access: 'public' },
    { access: 'protected' },
    { foo: 2 },
    { access: 'private' }])).toEqual([{
    access: 'public'
  }]);
});

it('filterAccess override', function () {
  expect(filterAccess(['private'], [{
    access: 'private'
  }])).toEqual([{
    access: 'private'
  }]);
});

it('filterAccess nesting', function () {
  expect(filterAccess(['public', 'protected', 'undefined'], [{
    access: 'public',
    members: {
      static: [{
        access: 'public'
      }, {
        access: 'private'
      }]
    }
  }, {
    access: 'private',
    members: {
      static: [{
        access: 'public'
      }, {
        access: 'private'
      }]
    }
  }])).toEqual([{
    access: 'public',
    members: {
      static: [{
        access: 'public'
      }]
    }
  }]);
});
