'use strict';

var test = require('tape'),
  path = require('path'),
  exec = require('child_process').exec;

function documentation(args, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  if (!options.cwd) {
    options.cwd = __dirname;
  }

  args.unshift(path.join(__dirname, '../bin/documentation.js'));

  exec(args.join(' '), options, function (err, stdout, stderr) {
    if (err) return callback(err, stdout, stderr);
    callback(err, JSON.parse(stdout), stderr);
  });
}

test('documentation binary', function (t) {
  documentation(['fixture/simple.input.js'], function (err, data) {
    t.error(err);
    t.equal(data.length, 1, 'simple has no dependencies');
    t.end();
  });
});

test('defaults to parsing package.json main', function (t) {
  documentation([], { cwd: path.join(__dirname, '..') }, function (err, data) {
    t.error(err);
    t.ok(data.length, 'we document ourself');
    t.end();
  });
});
