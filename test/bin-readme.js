var test = require('tap').test,
  path = require('path'),
  os = require('os'),
  exec = require('child_process').exec,
  tmp = require('tmp'),
  fs = require('fs-extra');

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

  exec(args.join(' '), options, callback);
}

var UPDATE = !!process.env.UPDATE;

test('readme command', function (group) {
  var fixtures = path.join(__dirname, 'fixture/readme');
  var sourceFile = path.join(fixtures, 'index.js');

  tmp.dir({unsafeCleanup: true}, function (err, d) {
    group.error(err);
    fs.copySync(path.join(fixtures, 'README.input.md'), path.join(d, 'README.md'));
    fs.copySync(path.join(fixtures, 'index.js'), path.join(d, 'index.js'));

    // run tests after setting up temp dir

    group.test('--diff-only: changes needed', function (t) {
      t.error(err);
      var before = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
      documentation(['readme index.js --diff-only -s API'], {cwd: d}, function (err, stdout, stderr) {
        var after = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
        t.ok(err);
        t.notEqual(err.code, 0, 'exit nonzero');
        t.same(after, before, 'readme unchanged');
        t.end();
      });
    });

    var expectedFile = path.join(fixtures, 'README.output.md');
    var expectedPath = path.join(fixtures, 'README.output.md');
    var expected = fs.readFileSync(expectedFile, 'utf-8');

    group.test('updates README.md', function (t) {
      documentation(['readme index.js -s API'], {cwd: d}, function (err, stdout) {
        var outputPath = path.join(d, 'README.md');
        t.error(err);

        if (UPDATE) {
          fs.writeFileSync(expectedPath, fs.readFileSync(outputPath, 'utf-8'));
        }

        var actual = fs.readFileSync(outputPath, 'utf-8');
        t.same(actual, expected, 'generated readme output');
        t.end();
      });
    });

    group.test('--readme-file', function (t) {
      fs.copySync(path.join(fixtures, 'README.input.md'), path.join(d, 'other.md'));
      documentation(['readme index.js -s API --readme-file other.md'], {cwd: d}, function (err, stdout) {
        t.error(err);
        var actualPath = path.join(d, 'other.md');
        if (UPDATE) {
          fs.writeFileSync(actualPath, expected);
        }
        var actual = fs.readFileSync(actualPath, 'utf-8');
        t.same(actual, expected, 'generated readme output');
        t.end();
      });
    });

    group.test('--diff-only: changes NOT needed', function (t) {
      t.error(err);
      fs.copySync(path.join(fixtures, 'README.output.md'), path.join(d, 'uptodate.md'));
      documentation(['readme index.js --diff-only -s API --readme-file uptodate.md'],
        {cwd: d}, function (err, stdout, stderr) {
          t.error(err);
          t.match(stdout, 'is up to date.');
          t.end();
        });
    });

    group.test('requires -s option', function (t) {
      documentation(['readme index.js'], {cwd: d}, function (err, stdout, stderr) {
        t.ok(err);
        t.ok(err.code !== 0, 'exit nonzero');
        t.match(stderr, 'Missing required argument: s');
        t.end();
      });
    });

    group.test('errors if specified readme section is missing', function (t) {
      documentation(['readme index.js -s DUMMY'], {cwd: d}, function (err, stdout, stderr) {
        t.ok(err);
        t.ok(err.code !== 0, 'exit nonzero');
        t.end();
      });
    });

    group.end();
  });
});

