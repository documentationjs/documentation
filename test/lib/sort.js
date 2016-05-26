'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort');

test('sort stream alphanumeric', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var banana = { context: { sortKey: 'c' }, name: 'bananas' };

  t.deepEqual(sort([
    apples, carrot, banana
  ]), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.deepEqual(sort([
    carrot, apples, banana
  ]), [
    apples, carrot, banana
  ], 'sort stream alphanumeric');

  t.end();
});

test('sort stream with configuration', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  t.deepEqual(sort([
    apples, carrot, bananas
  ], {
    toc: ['carrot', 'bananas']
  }), [
    carrot, bananas, apples
  ], 'with configuration');

  t.end();
});

test('sort stream with configuration and a section', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var section = { name: 'This is the banana type', description: 'here lies bananas' };

  var sectionMarkdown = {
    'name': 'This is the banana type',
    'description': {
      'type': 'root',
      'children': [{
        'type': 'paragraph',
        'children': [{
          'type': 'text',
          'value': 'here lies bananas',
          'position': {
            'start': {
              'line': 1,
              'column': 1,
              'offset': 0
            },
            'end': {
              'line': 1,
              'column': 18,
              'offset': 17
            },
            'indent': []
          }
        }],
        'position': {
          'start': {
            'line': 1,
            'column': 1,
            'offset': 0
          },
          'end': {
            'line': 1,
            'column': 18,
            'offset': 17
          },'indent': []
        }
      }],
      'position': {
        'start': {
          'line': 1,
          'column': 1,
          'offset': 0
        },
        'end': {
          'line': 1,
          'column': 18,
          'offset': 17
        }
      }
    },
    'kind': 'note'
  };

  t.deepEqual(sort([
    apples, carrot, bananas
  ], {
    toc: ['carrot', section, 'bananas']
  }), [
    carrot, sectionMarkdown, bananas, apples
  ], 'with configuration');

  t.end();
});
