'use strict';

var test = require('tap').test,
  filterAccess = require('../../lib/filter_access');

test('filterAccess default', function (t) {
  t.deepEqual(filterAccess(null, [{
    access: 'private'
  }]), []);
  t.end();
});

test('filterAccess public', function (t) {
  t.deepEqual(filterAccess(null, [{
    access: 'public'
  }]), [{
    access: 'public'
  }]);
  t.end();
});

test('filterAccess override', function (t) {
  t.deepEqual(filterAccess([], [{
    access: 'private'
  }]), [{
    access: 'private'
  }]);
  t.end();
});

test('filterAccess nesting', function (t) {
  t.deepEqual(filterAccess(null, [{
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
