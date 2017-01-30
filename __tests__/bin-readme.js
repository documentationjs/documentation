'use strict';
var path = require('path');
var os = require('os');
var pify = require('pify');
var exec = require('child_process').exec;
var tmp = require('tmp');
var fs = require('fs-extra');

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

  it('--diff-only: changes needed', function (done) {
    var before = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
    documentation(['readme index.js --diff-only -s API'], {cwd: d}, function (err, stdout, stderr) {
      var after = fs.readFileSync(path.join(d, 'README.md'), 'utf-8');
      expect(err).toBeTruthy();
      expect(err.code).not.toBe(0);
      expect(after).toEqual(before);
      done();
    });
  });

  var expectedFile = path.join(fixtures, 'README.output.md');
  var expectedPath = path.join(fixtures, 'README.output.md');
  var expected = fs.readFileSync(expectedFile, 'utf-8');

  it('updates README.md', function (done) {
    documentation(['readme index.js -s API'], {cwd: d}, function (err, stdout) {
      var outputPath = path.join(d, 'README.md');
      expect(err).toBeFalsy();

      if (UPDATE) {
        fs.writeFileSync(expectedPath, fs.readFileSync(outputPath, 'utf-8'));
      }

      var actual = fs.readFileSync(outputPath, 'utf-8');
      expect(actual).toEqual(expected);
      done();
    });
  });

  it('--readme-file', function (done) {
    fs.copySync(path.join(fixtures, 'README.input.md'), path.join(d, 'other.md'));
    documentation(['readme index.js -s API --readme-file other.md'], {cwd: d}, function (err, stdout) {
      expect(err).toBeFalsy();
      var actualPath = path.join(d, 'other.md');
      if (UPDATE) {
        fs.writeFileSync(actualPath, expected);
      }
      var actual = fs.readFileSync(actualPath, 'utf-8');
      expect(actual).toEqual(expected);
      done();
    });
  });

  it('--diff-only: changes NOT needed', function (done) {
    fs.copySync(path.join(fixtures, 'README.output.md'), path.join(d, 'uptodate.md'));
    documentation(['readme index.js --diff-only -s API --readme-file uptodate.md'],
      {cwd: d}, function (err, stdout, stderr) {
        expect(err).toBeFalsy();
        expect(stdout).toMatch('is up to date.');
        done();
      });
  });

  it('-s: not found', function (done) {
    fs.copySync(path.join(fixtures, 'README.output.md'), path.join(d, 'uptodate.md'));
    documentation(['readme index.js --diff-only -s NOTFOUND --readme-file uptodate.md'],
      {cwd: d}, function (err, stdout, stderr) {
        expect(err).toBeTruthy();
        done();
      });
  });

  it('requires -s option', function (done) {
    documentation(['readme index.js'], {cwd: d}, function (err, stdout, stderr) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
      expect(stderr).toMatch('Missing required argument: s');
      done();
    });
  });

  var badFixturePath = path.join(__dirname, 'fixture/bad/syntax.input.js');
  it('errors on invalid syntax', function (done) {
    documentation(['readme ' + badFixturePath + ' -s API'], {cwd: d}, function (err, stdout, stderr) {
      expect(err).toBeTruthy();
      expect(err.code !== 0).toBeTruthy();
      done();
    });
  });
});

