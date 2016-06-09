var createLinkerStack = require('../lib/output/util/linker_stack'),
  test = require('tap').test;

test('linkerStack', function (t) {

  var linkerStack = createLinkerStack({});

  t.equal(linkerStack.link('string'),
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
    'Default global resolution of string');

  t.equal(createLinkerStack({
    paths: {
      Point: 'http://geojson.org/geojson-spec.html#point'
    }
  }).link('Point'),
    'http://geojson.org/geojson-spec.html#point',
    'Custom hardcoded path for a GeoJSON type');

  t.end();
});
