var LinkerStack = require('../src/output/util/linker_stack');

test('linkerStack', function() {
  var linkerStack = new LinkerStack({});

  expect(linkerStack.link('string')).toBe(
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
  );

  expect(
    new LinkerStack({
      paths: {
        Point: 'http://geojson.org/geojson-spec.html#point'
      }
    }).link('Point')
  ).toBe('http://geojson.org/geojson-spec.html#point');

  expect(
    new LinkerStack({
      paths: {
        Image: 'http://custom.com/'
      }
    }).link('Image')
  ).toBe('http://custom.com/');

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

  expect(linker.link('Image')).toBe('#Image');
});
