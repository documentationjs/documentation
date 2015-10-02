'use strict';

var test = require('tap').test,
  resolveTheme = require('../../lib/resolve_theme');

test('resolveTheme', function (t) {

  t.throws(function () {
    resolveTheme('INVALID-THEME');
  });

  t.ok(resolveTheme('documentation-theme-default'), 'finds default');

  t.end();
});
