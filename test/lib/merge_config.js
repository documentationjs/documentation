'use strict';

var test = require('tap').test,
  path = require('path'),
  _ = require('lodash'),
  mergeConfig = require('../../lib/merge_config');

test('bad config', function(t) {
  mergeConfig({ config: 'DOES-NOT-EXIST' }).catch(err => {
    t.ok(err);
    t.end();
  });
});

test('nc(mergeConfig)', function(t) {
  // Omit configuration from output, for simplicity
  var nc = _.curryRight(_.omit, 2)([
    'config',
    'no-package',
    'parseExtension',
    'project-homepage',
    'project-name',
    'project-version'
  ]);

  Promise.all(
    [
      [
        { config: path.join(__dirname, '../config_fixture/config.json') },
        { foo: 'bar' }
      ],
      [
        {
          passThrough: true,
          config: path.join(__dirname, '../config_fixture/config.json')
        },
        { foo: 'bar', passThrough: true }
      ],
      [
        {
          config: path.join(__dirname, '../config_fixture/config_comments.json')
        },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config.yaml') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config.yml') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config') },
        { foo: 'bar' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config_links.yml') },
        { foo: 'hello [link](https://github.com/my/link) world' }
      ],
      [
        { config: path.join(__dirname, '../config_fixture/config_file.yml') },
        {
          toc: [
            {
              name: 'snowflake',
              file: path.join(__dirname, '../fixture/snowflake.md')
            }
          ]
        }
      ]
    ].map(pair =>
      mergeConfig(Object.assign(pair[0], { 'no-package': true }))
        .then(nc)
        .then(res => {
          t.deepEqual(res, pair[1]);
        }))
  ).then(res => {
    t.end();
  });
});
