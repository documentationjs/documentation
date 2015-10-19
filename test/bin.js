'use strict';

var test = require('tap').test,
  path = require('path'),
  os = require('os'),
  exec = require('child_process').exec,
  fs = require('fs');

function documentation(args, options, callback, parseJSON) {
  if (!callback) {
    callback = options;
    options = {};
  }

  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;

  args.unshift(path.join(__dirname, '../bin/documentation.js'));

  exec(args.join(' '), options, function (err, stdout, stderr) {
    if (err) {
      return callback(err, stdout, stderr);
    }
    if (parseJSON === false) {
      callback(err, stdout, stderr);
    } else {
      callback(err, JSON.parse(stdout), stderr);
    }
  });
}

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = '[path]';
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
  documentation(['fixture/sorting/input.js -c fixture/config.json'],
    function (err, data) {
      t.error(err);
      if (process.env.UPDATE) {
        fs.writeFileSync(
          path.resolve(__dirname,
            'fixture',
            'sorting/output.json'), JSON.stringify(normalize(data), null, 2), 'utf8');
      }
      var expected = fs.readFileSync(
        path.resolve(__dirname,
          'fixture',
          'sorting/output.json'), 'utf8');
      t.deepEqual(
        normalize(data),
        JSON.parse(expected),
        'respected sort order from config file');
      t.end();
    });
});

test('--shallow option', function (t) {
  documentation(['--shallow fixture/internal.input.js'], function (err, data) {
    t.error(err);
    t.equal(data.length, 0, 'should not check dependencies');
    t.end();
  });
});

test('bad -f option', function (t) {
  documentation(['-f DOES-NOT-EXIST fixture/internal.input.js'], function (err) {
    t.ok(err, 'returns error');
    t.end();
  });
});

test('html with no destination', function (t) {
  documentation(['-f html fixture/internal.input.js'], function (err) {
    t.ok(err.toString()
      .match(/The HTML output mode requires a destination directory set with -o/),
      'needs dest for html');
    t.end();
  });
});

test('--lint option', function (t) {
  documentation(['--lint fixture/lint/lint.input.js'], function (err, data) {
    var output = path.join(__dirname, 'fixture/lint/lint.output.js');
    data = data.toString().split('\n').slice(2).join('\n');
    if (process.env.UPDATE) {
      fs.writeFileSync(output, data);
    }
    t.equal(err.code, 1);
    t.equal(data, fs.readFileSync(output, 'utf8'), 'outputs lint');
    t.end();
  });
});

test('--lint option on good file', function (t) {
  documentation(['--lint fixture/simple.input.js'], {}, function (err, data) {
    t.equal(err, null);
    t.equal(data, '', 'no output');
    t.end();
  }, false);
});

test('given no files', function (t) {
  documentation([''], function (err) {
    t.ok(err.toString()
      .match(/documentation was given no files and was not run in a module directory/),
      'no files given');
    t.end();
  });
});

test('write to file', function (t) {

  var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

  documentation(['--shallow fixture/internal.input.js -o ' + dst], {}, function (err, data) {
    t.error(err);
    t.equal(data, '');
    t.ok(fs.existsSync(dst), 'created file');
    t.end();
  }, false);
});

test('write to html', function (t) {

  var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
  fs.mkdirSync(dstDir);

  documentation(['--shallow fixture/internal.input.js -f html -o ' + dstDir], {},
    function (err, data) {
      t.error(err);
      t.equal(data, '');
      t.ok(fs.existsSync(path.join(dstDir, 'index.html')), 'created index.html');
      t.end();
    }, false);
});

test('fatal error', function (t) {

  documentation(['--shallow fixture/bad/syntax.input.js'], {},
    function (err) {
      t.ok(err.toString().match(/Unexpected token/), 'reports syntax error');
      t.end();
    }, false);
});
