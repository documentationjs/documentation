import internalOnly from '../../src/module_filters.js';

test('moduleFilters.internalOnly', function () {
  expect(internalOnly('./foo')).toEqual(true);
  expect(internalOnly('foo')).toEqual(false);
});
