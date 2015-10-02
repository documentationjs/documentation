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

  t.end();
});
