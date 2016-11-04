'use strict';

var test = require('tap').test,
  filterAccess = require('../../lib/filter_access');

test('filterAccess ignore', function (t) {
  t.deepEqual(filterAccess(['public', 'protected', 'undefined'], [{
    access: 'public',
    ignore: true
  }]), []);
  t.end();
});

test('filterAccess public, protected, undefined, no private', function (t) {
  t.deepEqual(filterAccess(['public', 'protected', 'undefined'], [{
    access: 'public'
  }, {
    access: 'protected'
  }, {
    foo: 2
  }, {
    access: 'private'
  }]), [{
    access: 'public'
  }, {
    access: 'protected'
  }, {
    foo: 2
  }]);
  t.end();
});

test('filterAccess explicit public', function (t) {
  t.deepEqual(filterAccess(['public'], [
    { access: 'public' },
    { access: 'protected' },
    { foo: 2 },
    { access: 'private' }]),
    [{
      access: 'public'
    }]);
  t.end();
});

test('filterAccess override', function (t) {
  t.deepEqual(filterAccess(['private'], [{
    access: 'private'
  }]), [{
    access: 'private'
  }]);
  t.end();
});

test('filterAccess nesting', function (t) {
  t.deepEqual(filterAccess(['public', 'protected', 'undefined'], [{
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
  }]), [{
    access: 'public',
    members: {
      static: [{
        access: 'public'
      }]
    }
  }]);
  t.end();
});
