'use strict';

var test = require('tape'),
  fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec;

var UPDATE = !!process.env.UPDATE;

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
    callback(err, stdout, stderr);
  });
}

test('documentation binary', function (t) {
  documentation(['fixture/simple.input.js'], function (err, data) {
    t.error(err);
    t.equal(JSON.parse(data).length, 1, 'simple has no dependencies');
    t.end();
  });
});

test('markdown output', function (t) {
  documentation([ 'fixture/simple.input.js', '-f', 'md' ], function (err, data) {
    t.error(err);
    var outputfile = path.join(__dirname, 'fixture', 'simple.output.md');
    if (UPDATE) fs.writeFileSync(outputfile, data);
    var expect = fs.readFileSync(outputfile, 'utf8');
    t.equal(data, expect, 'simple has no dependencies');
    t.end();
  });
});

test('defaults to parsing package.json main', function (t) {
  documentation([], { cwd: path.join(__dirname, '..') }, function (err, data) {
    t.error(err);
    t.ok(JSON.parse(data).length, 'we document ourself');
    t.end();
  });
});
