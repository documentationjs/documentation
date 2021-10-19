import moduleFilters from '../../src/module_filters.js';

test('moduleFilters.internalOnly', function () {
  expect(moduleFilters.internalOnly('./foo')).toEqual(true);
  expect(moduleFilters.internalOnly('foo')).toEqual(false);
});

test('moduleFilters.externals', function () {
  expect(moduleFilters.externals([], {})('./foo')).toEqual(true);
  expect(
    moduleFilters.externals([], { external: 'node_modules' })('./foo')
  ).toEqual(true);
});
