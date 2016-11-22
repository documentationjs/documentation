'use strict';

var test = require('tap').test,
  sort = require('../../lib/sort'),
  path = require('path');

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

test('sort an already-sorted stream containing a section/description', function (t) {
  // this happens in the 'serve' task
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

  var config = {
    toc: ['carrot', section, 'bananas']
  };

  var sortOnce = sort([apples, carrot, bananas], config);
  var sortTwice = sort(sortOnce, config);
  t.deepEqual(sortTwice, [carrot, sectionMarkdown, bananas, apples]);
  t.end();
});

test('sort toc with files', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var snowflake = {
    name: 'snowflake',
    file: 'test/fixture/snowflake.md'
  };

  var processedSnowflake = {
    name: 'snowflake',
    kind: 'note',
    description: {
      children: [{
        children: [{
          position: {
            end: {column: 16, line: 1, offset: 15},
            indent: [],
            start: {column: 3, line: 1, offset: 2}
          },
          type: 'text',
          value: 'The Snowflake'
        }],
        depth: 1,
        position: {
          end: {column: 16, line: 1, offset: 15},
          indent: [],
          start: {column: 1, line: 1, offset: 0}
        },
        type: 'heading'
      }],
      position: {
        end: {column: 1, line: 2, offset: 16},
        start: {column: 1, line: 1, offset: 0}
      },
      type: 'root'
    }
  };
  t.deepEqual(sort([
    apples, carrot, bananas
  ], {
    toc: [snowflake]
  }), [
    processedSnowflake, apples, carrot, bananas
  ], 'with configuration');

  t.end();
});

test('sort toc with files absolute path', function (t) {
  var apples = { context: { sortKey: 'a' }, name: 'apples' };
  var carrot = { context: { sortKey: 'b' }, name: 'carrot' };
  var bananas = { context: { sortKey: 'c' }, name: 'bananas' };

  var snowflake = {
    name: 'snowflake',
    file: path.join(__dirname, '../fixture/snowflake.md')
  };

  var processedSnowflake = {
    name: 'snowflake',
    kind: 'note',
    description: {
      children: [{
        children: [{
          position: {
            end: {column: 16, line: 1, offset: 15},
            indent: [],
            start: {column: 3, line: 1, offset: 2}
          },
          type: 'text',
          value: 'The Snowflake'
        }],
        depth: 1,
        position: {
          end: {column: 16, line: 1, offset: 15},
          indent: [],
          start: {column: 1, line: 1, offset: 0}
        },
        type: 'heading'
      }],
      position: {
        end: {column: 1, line: 2, offset: 16},
        start: {column: 1, line: 1, offset: 0}
      },
      type: 'root'
    }
  };
  t.deepEqual(sort([
    apples, carrot, bananas
  ], {
    toc: [snowflake]
  }), [
    processedSnowflake, apples, carrot, bananas
  ], 'with configuration');

  t.end();
});
