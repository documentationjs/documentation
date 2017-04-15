'use strict';

var test = require('tap').test;
var nestTag = require('../../lib/nest').nestTag;

// Print a tree of tags in a way that's easy to test.
var printTree = indent =>
  node =>
    `${new Array(indent + 1).join(' ')}- ${node.name}${node.properties ? '\n' : ''}${(node.properties || [
    ])
      .map(printTree(indent + 1))
      .join('\n')}`;

var printNesting = params =>
  printTree(0)({ properties: nestTag(params), name: 'root' });

test('nest params - basic', function(t) {
  var params = [
    'foo',
    'foo.bar',
    'foo.bar.third',
    'foo.third',
    'foo.third[].baz'
  ].map(name => ({ name }));
  t.equal(
    printNesting(params),
    `- root
 - foo
  - foo.bar
   - foo.bar.third
  - foo.third
   - foo.third[].baz`
  );
  t.end();
});

test('nest params - multiple roots', function(t) {
  var params = ['a', 'b', 'c'].map(name => ({ name }));
  t.equal(
    printNesting(params),
    `- root
 - a
 - b
 - c`
  );
  t.end();
});

test('nest params - missing parent', function(t) {
  var params = ['foo', 'foo.bar.third'].map(name => ({ name }));
  t.throws(() => {
    nestTag(params);
  });
  t.end();
});

test('nest params - #658', function(t) {
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
  t.equal(
    printNesting(params),
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
  t.end();
});

test('nest params - #554', function(t) {
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
  t.equal(
    printNesting(params),
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
  t.end();
});
