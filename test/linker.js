'use strict';
var LinkerStack = require('../lib/output/util/linker_stack'),
  test = require('tap').test;

test('linkerStack', function(t) {
  var linkerStack = new LinkerStack({});

  t.equal(
    linkerStack.link('string'),
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
    'Default global resolution of string'
  );

  t.equal(
    new LinkerStack({
      paths: {
        Point: 'http://geojson.org/geojson-spec.html#point'
      }
    }).link('Point'),
    'http://geojson.org/geojson-spec.html#point',
    'Custom hardcoded path for a GeoJSON type'
  );

  t.equal(
    new LinkerStack({
      paths: {
        Image: 'http://custom.com/'
      }
    }).link('Image'),
    'http://custom.com/',
    'Prefers config link to native.'
  );

  var linker = new LinkerStack({
    paths: {
      Image: 'http://custom.com/'
    }
  });

  linker.namespaceResolver(
    [
      {
        namespace: 'Image'
      }
    ],
    function(namespace) {
      return '#' + namespace;
    }
  );

  t.equal(linker.link('Image'), '#Image', 'Prefers local link over all.');

  t.end();
});
