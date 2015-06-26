'use strict';

var test = require('prova'),
  path = require('path'),
  exec = require('child_process').exec,
  fs = require('fs');

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

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = path.relative(__dirname, item.context.file);
  });
  return result;
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

test('accepts config file', function (t) {
  documentation(['fixture/sorting/input.js -c fixture/config.json'], function (err, data) {
    t.error(err);
    var expected = fs.readFileSync(path.resolve(__dirname, 'fixture', 'sorting/output.json'), 'utf8');
    t.deepEqual(normalize(data), JSON.parse(expected), 'respected sort order from config file');
    t.end();
  });
});
