var nestTag = require('../../src/nest').nestTag;

// Print a tree of tags in a way that's easy to test.
var printTree = indent => node =>
  `${new Array(indent + 1).join(' ')}- ${node.name}${node.properties ? '\n' : ''}${(node.properties || [
  ])
    .map(printTree(indent + 1))
    .join('\n')}`;

var printNesting = params =>
  printTree(0)({ properties: nestTag(params), name: 'root' });

test('nest params - basic', function() {
  var params = [
    'foo',
    'foo.bar',
    'foo.bar.third',
    'foo.third',
    'foo.third[].baz'
  ].map(name => ({ name }));
  expect(printNesting(params)).toBe(
    `- root
 - foo
  - foo.bar
   - foo.bar.third
  - foo.third
   - foo.third[].baz`
  );
});

test('nest params - multiple roots', function() {
  var params = ['a', 'b', 'c'].map(name => ({ name }));
  expect(printNesting(params)).toBe(
    `- root
 - a
 - b
 - c`
  );
});

test('nest params - missing parent', function() {
  var params = ['foo', 'foo.bar.third'].map(name => ({ name }));
  expect(() => {
    nestTag(params);
  }).toThrow();
});

test('nest params - #658', function() {
  var params = [
    'state',
    'payload',
    'payload.input_meter_levels',
    'payload.input_meter_levels[].peak',
    'payload.input_meter_levels[].rms',
    'payload.output_meter_levels',
    'payload.output_meter_levels[].peak',
    'payload.output_meter_levels[].rms'
  ].map(name => ({ name }));
  expect(printNesting(params)).toBe(
    `- root
 - state
 - payload
  - payload.input_meter_levels
   - payload.input_meter_levels[].peak
   - payload.input_meter_levels[].rms
  - payload.output_meter_levels
   - payload.output_meter_levels[].peak
   - payload.output_meter_levels[].rms`
  );
});

test('nest params - #554', function() {
  var params = [
    'x',
    'yIn',
    'options',
    'options.sgOption',
    'options.minMaxRatio',
    'options.broadRatio',
    'options.noiseLevel',
    'options.maxCriteria',
    'options.smoothY',
    'options.realTopDetection',
    'options.heightFactor',
    'options.boundaries',
    'options.derivativeThreshold'
  ].map(name => ({ name }));
  expect(printNesting(params)).toBe(
    `- root
 - x
 - yIn
 - options
  - options.sgOption
  - options.minMaxRatio
  - options.broadRatio
  - options.noiseLevel
  - options.maxCriteria
  - options.smoothY
  - options.realTopDetection
  - options.heightFactor
  - options.boundaries
  - options.derivativeThreshold`
  );
});
