'use strict';

var test = require('tap').test,
  path = require('path'),
  loadConfig = require('../../lib/load_config');

test('loadConfig', function (t) {

  t.throws(function () {
    loadConfig('DOES-NOT-EXIST');
  });

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config.json')),
    { foo: 'bar' });

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config_comments.json')),
    { foo: 'bar' }, 'config with comments');

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config.yaml')),
    { foo: 'bar' }, 'config.yaml');

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config.yml')),
    { foo: 'bar' }, 'config.yml');

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config')),
    { foo: 'bar' }, 'config in yaml without extension');

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config_links.yml')),
    { foo: 'hello [link](https://github.com/my/link) world' }, 'config with markdown link');

  t.deepEqual(loadConfig(path.join(__dirname, '../config_fixture/config_file.yml')),{
    toc: [{
      name: 'snowflake',
      file: path.join(__dirname, '../fixture/snowflake.md')
    }]
  }, 'config with file reference');

  t.end();
});
