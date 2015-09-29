'use strict';

var test = require('tap').test,
  filterAccess = require('../../lib/filter_access');

test('filterAccess default', function (t) {
  t.equal(filterAccess(null, {
    access: 'private'
  }), false);
  t.end();
});

test('filterAccess public', function (t) {
  t.equal(filterAccess(null, {
    access: 'public'
  }), true);
  t.end();
});

test('filterAccess override', function (t) {
  t.equal(filterAccess([], {
    access: 'private'
  }), true);
  t.end();
});
