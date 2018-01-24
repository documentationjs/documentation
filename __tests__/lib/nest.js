const nestTag = require('../../src/nest').nestTag;

// Print a tree of tags in a way that's easy to test.
const printTree = indent => node =>
  `${new Array(indent + 1).join(' ')}- ${node.name}${
    node.properties ? '\n' : ''
  }${(node.properties || []).map(printTree(indent + 1)).join('\n')}`;

const printNesting = params =>
  printTree(0)({ properties: nestTag(params), name: 'root' });

test('nest params - basic', function() {
  const params = [
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
  const params = ['a', 'b', 'c'].map(name => ({ name }));
  expect(printNesting(params)).toBe(
    `- root
 - a
 - b
 - c`
  );
});

test('nest params - missing parent', function() {
  const params = ['foo', 'foo.bar.third'].map(name => ({ name }));
  expect(() => {
    nestTag(params);
  }).toThrow();
});

test('nest params - #658', function() {
  const params = [
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
  const params = [
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
