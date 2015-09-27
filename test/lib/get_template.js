'use strict';

var getTemplate = require('../../lib/get_template.js'),
  Handlebars = require('handlebars'),
  test = require('tap').test;

test('getTemplate', function (t) {

  t.throws(function () {
    getTemplate(Handlebars, 'DOES_NOT_EXIST', 'foo');
  }, 'Template file foo missing');

  t.end();
});
