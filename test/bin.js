'use strict';

var test = require('tap').test,
  path = require('path'),
  os = require('os'),
  exec = require('child_process').exec,
  tmp = require('tmp'),
  fs = require('fs-extra');

function documentation(args, options, callback, parseJSON) {
  if (!callback) {
    parseJSON = callback;
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

var options = { timeout: 1000 * 120 };

test('documentation binary', options, function (t) {
  documentation(['build fixture/simple.input.js'], function (err, data) {
    t.error(err);
    t.equal(data.length, 1, 'simple has no dependencies');
    t.end();
  });
});

test('defaults to parsing package.json main', options, function (t) {
  documentation(['build'], { cwd: path.join(__dirname, '..') }, function (err, data) {
    t.error(err);
    t.ok(data.length, 'we document ourself');
    t.end();
  });
});

test('polyglot mode', options, function (t) {
  documentation(['build fixture/polyglot/blend.cpp --polyglot'],
    function (err, data) {
      t.ifError(err);
      if (process.env.UPDATE) {
        fs.writeFileSync(
          path.resolve(__dirname,
            'fixture',
            'polyglot/blend.json'), JSON.stringify(normalize(data), null, 2), 'utf8');
      }
      var expected = fs.readFileSync(
        path.resolve(__dirname,
          'fixture',
          'polyglot/blend.json'), 'utf8');
      t.deepEqual(
        normalize(data),
        JSON.parse(expected),
        'parsed C++ file');
      t.end();
    });
});

test('accepts config file', options, function (t) {
  documentation(['build fixture/sorting/input.js -c fixture/config.json'],
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

test('accepts config file - reports failures', options, function (t) {
  documentation(['build fixture/sorting/input.js -c fixture/config-bad.yml'], {},
    function (err, data, stderr) {
      t.error(err);
      if (process.env.UPDATE) {
        fs.writeFileSync(
          path.resolve(__dirname,
            'fixture',
            'sorting/output-bad.txt'), stderr, 'utf8');
      }
      var expected = fs.readFileSync(
        path.resolve(__dirname,
          'fixture',
          'sorting/output-bad.txt'), 'utf8');
      t.equal(stderr, expected, 'reported a missing toc entry');
      t.end();
    }, false);
});

test('--shallow option', function (t) {
  documentation(['build --shallow fixture/internal.input.js'], function (err, data) {
    t.error(err);
    t.equal(data.length, 0, 'should not check dependencies');
    t.end();
  });
});

test('external modules option', function (t) {
  documentation(['build fixture/external.input.js ' +
    '--external=external --external=external/node_modules'], function (err, data) {
    t.ifError(err);
    t.equal(data.length, 2, 'Includes external file');
    t.end();
  });
});

test('extension option', function (t) {
  documentation(['build fixture/extension/index.otherextension ' +
    '--extension=otherextension'], function (err, data) {
    t.ifError(err);
    t.equal(data.length, 1, 'includes a file with an arbitrary extension');
    t.end();
  });
});

test('extension option', function (t) {
  documentation(['build fixture/extension.jsx'], function (err, data) {
    t.ifError(err);
    t.end();
  });
});

test('invalid arguments', function (group) {
  group.test('bad -f option', options, function (t) {
    documentation(['build -f DOES-NOT-EXIST fixture/internal.input.js'], {}, function (err) {
      t.ok(err, 'returns error');
      t.end();
    }, false);
  });

  group.test('html with no destination', options, function (t) {
    documentation(['build -f html fixture/internal.input.js'], function (err) {
      t.ok(err.toString()
        .match(/The HTML output mode requires a destination directory set with -o/),
        'needs dest for html');
      t.end();
    });
  });

  group.test('bad command', function (t) {
    documentation(['-f html fixture/internal.input.js'], {}, function (err, stdout, stderr) {
      t.ok(err.code, 'exits nonzero');
      t.end();
    }, false);
  });

  group.end();
});

test('--config', options, function (t) {
  var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
  fs.mkdirSync(dst);
  var outputIndex = path.join(dst, 'index.html');
  var expectedOutputPath = path.join(__dirname, 'fixture/html/nested.config-output.html');
  documentation(['build -c fixture/html/documentation.yml -f html fixture/html/nested.input.js -o ' +
    dst], function (err) {
    t.notOk(err);
    var output = fs.readFileSync(outputIndex, 'utf8');
    if (process.env.UPDATE) {
      fs.writeFileSync(expectedOutputPath, output);
    }
    var expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8');
    t.equal(expectedOutput, output, 'generates correct output');
    t.end();
  }, false);
});

test('--version', options, function (t) {
  documentation(['--version'], {}, function (err, output) {
    t.ok(output, 'outputs version');
    t.end();
  }, false);
});

test('lint command', function (group) {

  group.test('generates lint output', options, function (t) {
    documentation(['lint fixture/lint/lint.input.js'], function (err, data) {
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

  group.test('generates no output on a good file', options, function (t) {
    documentation(['lint fixture/simple.input.js'], {}, function (err, data) {
      t.equal(err, null);
      t.equal(data, '', 'no output');
      t.end();
    }, false);
  });

  group.test('exposes syntax error on a bad file', options, function (t) {
    documentation(['lint fixture/bad/syntax.input.js'], {}, function (err, data) {
      t.ok(err.code > 0, 'exits with a > 0 exit code');
      t.end();
    }, false);
  });

  group.end();
});

test('given no files', options, function (t) {
  documentation(['build'], function (err) {
    t.ok(err.toString()
      .match(/documentation was given no files and was not run in a module directory/),
      'no files given');
    t.end();
  });
});

test('with an invalid command', options, function (t) {
  documentation(['invalid'], {}, function (err) {
    t.ok(err, 'returns error');
    t.end();
  }, false);
});

test('--access flag', function (t) {
  documentation(['build --shallow fixture/internal.input.js -a public'], {}, function (err, data) {
    t.error(err);
    t.equal(data, '[]');
    t.end();
  }, false);
});

test('--private flag', function (t) {
  documentation(['build fixture/internal.input.js --private'], {}, function (err, data) {
    t.error(err);
    t.ok(data.length > 2, 'outputs docs');
    t.end();
  }, false);
});

test('--infer-private flag', function (t) {
  documentation(['build fixture/infer-private.input.js --infer-private ^_'], {}, function (err, data) {
    t.error(err);

    // This uses JSON.parse with a reviver used as a visitor.
    JSON.parse(data, function (n, v) {
      // Make sure we do not see any names that match `^_`.
      if (n === 'name') {
        t.equal(typeof v, 'string');
        t.ok(!/_$/.test(v));
      }
      return v;
    });
    t.end();
  }, false);
});

test('write to file', options, function (t) {

  var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

  documentation(['build --shallow fixture/internal.input.js -o ' + dst], {}, function (err, data) {
    t.error(err);
    t.equal(data, '');
    t.ok(fs.existsSync(dst), 'created file');
    t.end();
  }, false);
});

test('write to html', options, function (t) {

  var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
  fs.mkdirSync(dstDir);

  documentation(['build --shallow fixture/internal.input.js -f html -o ' + dstDir], {},
    function (err, data) {
      t.error(err);
      t.equal(data, '');
      t.ok(fs.existsSync(path.join(dstDir, 'index.html')), 'created index.html');
      t.end();
    }, false);
});

test('write to html with custom theme', options, function (t) {

  var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
  fs.mkdirSync(dstDir);

  documentation(['build -t fixture/custom_theme --shallow fixture/internal.input.js -f html -o ' + dstDir], {},
    function (err, data) {
      t.error(err);
      t.equal(data, '');
      t.ok(fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8'), 'Hello world');
      t.end();
    }, false);
});

test('write to html, highlightAuto', options, function (t) {

  var fixture = 'fixture/auto_lang_hljs/multilanguage.input.js',
    config = 'fixture/auto_lang_hljs/config.yml',
    dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

  fs.mkdirSync(dstDir);

  documentation(['build --shallow ' + fixture + ' -c ' + config + ' -f html -o ' + dstDir], {},
    function (err) {
      t.ifErr(err);
      var result = fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8');
      t.ok(result.indexOf('<span class="hljs-number">42</span>') > 0,
        'javascript is recognized by highlightjs');
      t.ok(result.indexOf('<span class="hljs-selector-attr">[data-foo]</span>') > 0,
        'css is recognized by highlightjs');
      t.ok(result.indexOf('<span class="hljs-attr">data-foo</span>') > 0,
        'html is recognized by highlightjs');
      t.end();
    }, false);
});

test('fatal error', options, function (t) {

  documentation(['build --shallow fixture/bad/syntax.input.js'], {},
    function (err) {
      t.ok(err.toString().match(/Unexpected token/), 'reports syntax error');
      t.end();
    }, false);
});

test('build --document-exported', function (t) {

  documentation(['build fixture/document-exported.input.js --document-exported -f md'], {}, function (err, data) {
    t.error(err);

    var outputfile = path.join(__dirname, 'fixture', 'document-exported.output.md');
    if (process.env.UPDATE) {
      fs.writeFileSync(outputfile, data, 'utf8');
    }

    var expect = fs.readFileSync(outputfile, 'utf-8');
    t.equal(data, expect);
    t.end();
  }, false);
}, options);

test('build large file without error (no deoptimized styling error)', function (t) {

  var dstFile = path.join(os.tmpdir(), (Date.now() + Math.random()).toString()) + '.js';
  var contents = '';
  for (var i = 0; i < 4e4; i++) {
    contents += '/* - */\n';
  }
  fs.writeFileSync(dstFile, contents, 'utf8');

  documentation(['build ' + dstFile], {}, function (err, data, stderr) {
    t.error(err);
    t.equal(stderr, '');
    fs.unlinkSync(dstFile);
    t.end();
  }, false);
}, options);
