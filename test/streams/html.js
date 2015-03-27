'use strict';

var test = require('prova'),
  html = require('../../streams/html'),
  concat = require('concat-stream');

test('normalizes tags', function (t) {
  var stream = html();

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      'description': '<p><strong>this is markdown</strong></p>\n',
      'tags': [{
        'title': 'returns',
        'description': '<p>numberone or <a href="http://google.com">google</a></p>\n',
        'type': {
          'type': 'NameExpression',
          'name': 'Number'
        }
      }]
    }]);
    t.end();
  }));

  stream.end({
    description: '**this is markdown**',
    tags: [
      {
        'title': 'returns',
        'description': 'numberone or [google](http://google.com)',
        'type': {
          'type': 'NameExpression',
          'name': 'Number'
        }
      }
    ]
  });
});

test('opt-out of param parsing', function (t) {
  var stream = html({}, ['description']);

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      'description': '<p><strong>this is markdown</strong></p>\n',
      'tags': [{
        'title': 'returns',
        'description': 'numberone or [google](http://google.com)',
        'type': {
          'type': 'NameExpression',
          'name': 'Number'
        }
      }]
    }]);
    t.end();
  }));

  stream.end({
    description: '**this is markdown**',
    tags: [
      {
        'title': 'returns',
        'description': 'numberone or [google](http://google.com)',
        'type': {
          'type': 'NameExpression',
          'name': 'Number'
        }
      }
    ]
  });
});

test('passing options to remarkable', function (t) {
  var stream = html({
    linkify: true
  });

  stream.pipe(concat(function (data) {
    t.deepEqual(data, [{
      'description': '<ul>\n<li><a href="http://foo.com/">http://foo.com/</a></li>\n</ul>\n'
    }]);
    t.end();
  }));

  stream.end({
    description: '+ http://foo.com/'
  });
});

