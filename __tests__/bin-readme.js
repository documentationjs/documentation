'use strict';
var path = require('path');
var os = require('os');
var pify = require('pify');
var exec = require('child_process').exec;
var tmp = require('tmp');
var fs = require('fs-extra');

function documentation(args, options, parseJSON) {
  options = options || {};

  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;

  args.unshift(path.join(__dirname, '../bin/documentation.js'));

  return pify(exec)(args.join(' '), options);
}

var UPDATE = !!process.env.UPDATE;

describe('readme command', function () {
  var fixtures = path.join(__dirname, 'fixture/readme');
  var sourceFile = path.join(fixtures, 'index.js');
  var d;

  beforeAll(function () {
    return pify(tmp.dir)({unsafeCleanup: true}).then(function (_d) {
      fs.copySync(path.join(fixtures, 'README.input.md'), path.join(_d, 'README.md'));
      fs.copySync(path.join(fixtures, 'index.js'), path.join(_d, 'index.js'));
      d = _d;
    });
  });

  // run tests after setting up temp dir

  it('--diff-only: changes needed', function () {
    var before = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
    return documentation(['readme index.js --diff-only -s API'], {cwd: d}).catch(function (err) {
      var after = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
      expect(err).toBeTruthy();
      expect(err.code).not.toBe(0);
      expect(after).toEqual(before);
    });
  });

  var expectedFile = path.join(fixtures, 'README.output.md');
  var expectedPath = path.join(fixtures, 'README.output.md');
  var expected = fs.readFileSync(expectedFile, 'utf-8');

  it('updates README.md', function () {
    return documentation(['readme index.js -s API'], {cwd: d}).then(function (stdout) {
      var outputPath = path.join(d, 'README.md');

      if (UPDATE) {
        fs.writeFileSync(expectedPath, fs.readFileSync(outputPath, 'utf-8'));
      }

      var actual = fs.readFileSync(outputPath, 'utf-8');
      expect(actual).toEqual(expected);
    });
  });

  it('--readme-file', function () {
    fs.copySync(path.join(fixtures, 'README.input.md'), path.join(d, 'other.md'));
    return documentation(['readme index.js -s API --readme-file other.md'], {cwd: d}).then(function (stdout) {
      var actualPath = path.join(d, 'other.md');
      if (UPDATE) {
        fs.writeFileSync(actualPath, expected);
      }
      var actual = fs.readFileSync(actualPath, 'utf-8');
      expect(actual).toEqual(expected);
    });
  });

  it('--diff-only: changes NOT needed', function () {
    fs.copySync(path.join(fixtures, 'README.output.md'), path.join(d, 'uptodate.md'));
    return documentation(['readme index.js --diff-only -s API --readme-file uptodate.md'],
      {cwd: d}).then(function (stdout, stderr) {
        expect(stdout).toMatch('is up to date.');
      });
  });

  it('-s: not found', function () {
    fs.copySync(path.join(fixtures, 'README.output.md'), path.join(d, 'uptodate.md'));
    return documentation(['readme index.js --diff-only -s NOTFOUND --readme-file uptodate.md'],
      {cwd: d}).catch(function (err) {
        expect(err).toBeTruthy();
      });
  });

  it('requires -s option', function () {
    return documentation(['readme index.js'], {cwd: d}).catch(function (err) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
    });
  });

  var badFixturePath = path.join(__dirname, 'fixture/bad/syntax.input.js');
  it('errors on invalid syntax', function () {
    return documentation(['readme ' + badFixturePath + ' -s API'], {cwd: d}).catch(function (err) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
    });
  });
});

