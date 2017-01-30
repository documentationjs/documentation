'use strict';

var path = require('path');
var os = require('os');
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

  return new Promise((resolve, reject) => {
    exec(args.join(' '), options, function (err, stdout, stderr) {
      if (err) {
        return reject(stderr);
      }
      if (stderr) {
        return reject(stderr);
      }
      if (parseJSON === false) {
        resolve(stdout);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch(err) {
          console.log('Failed to parse ' + stdout + ' from args ' + args);
          reject(err);
        }
      }
    });
  });
}

function normalize(result) {
  result.forEach(function (item) {
    item.context.file = '[path]';
  });
  return result;
}

describe('binary', function () {
  it('documentation binary', function () {
    return documentation(['build fixture/simple.input.js']).then(function (data) {
      expect(data.length).toBe(1);
    });
  });

  it('defaults to parsing package.json main', function () {
    return documentation(['build'], { cwd: path.join(__dirname, '..') }).then(function (data) {
      expect(data.length).toBeTruthy();
    });
  });

  it('polyglot mode', function () {
    return documentation(['build fixture/polyglot/blend.cpp --polyglot']).then(data => {
      expect(normalize(data)).toMatchSnapshot();
    });
  });

  it('accepts config file', function () {
    return documentation(['build fixture/sorting/input.js -c fixture/config.json']).then(data => {
      expect(normalize(data)).toMatchSnapshot();
    });
  });

  it('accepts config file - reports failures', function () {
    return documentation(['build fixture/sorting/input.js -c fixture/config-bad.yml'], false).catch(err => {
      expect(err).toMatchSnapshot();
    });
  });

  it('accepts config file - reports parse failures', function () {
    return documentation(['build fixture/sorting/input.js -c fixture/config-malformed.json'], {}, false).catch(err => {
      expect(err).toMatch(/SyntaxError/g);
    });
  });

  it('--shallow option', function () {
    return documentation(['build --shallow fixture/internal.input.js']).then(data => {
      expect(data.length).toBe(0);
    });
  });

  it('external modules option', function () {
    return documentation(['build fixture/external.input.js ' +
      '--external=external --external=external/node_modules']).then(data => {
        expect(data.length).toBe(2);
      });
  });

  it('when a file is specified both in a glob and explicitly, it is only documented once', function () {
    return documentation(['build fixture/simple.input.js fixture/simple.input.*']).then(data => {
      expect(data.length).toBe(1);
    });
  });

  it('extension option', function () {
    documentation(['build fixture/extension/index.otherextension ' +
      '--requireExtension=otherextension --parseExtension=otherextension']).then(data => {
        expect(data.length).toBe(1);
      });
  });

  /*
   * This tests that parseExtension adds extensions to smartGlob's
   * look through directories.
   */
  it('polyglot + parseExtension + smartGlob', function () {
    return documentation(['build fixture/polyglot ' +
      '--polyglot --parseExtension=cpp']).then(data => {
        expect(data.length).toBe(1);
      });
  });

  it('extension option', function () {
    return documentation(['build fixture/extension.jsx']).then(data => {
      expect(data).toEqual([]);
    });
  });

  describe('invalid arguments', function () {
    it('bad -f option', function () {
      return documentation(['build -f DOES-NOT-EXIST fixture/internal.input.js'], {}, false)
        .catch(err => {
          expect(err).toBeTruthy();
        });
    });

    it('html with no destination', function () {
      return documentation(['build -f html fixture/internal.input.js']).catch(err => {
        expect(err.toString()
          .match(/The HTML output mode requires a destination directory set with -o/)).toBeTruthy();
      });
    });

    it('bad command', function () {
      documentation(['-f html fixture/internal.input.js']).catch(err => {
        expect(err.code).toBeTruthy();
      }, false);
    });

  });

  it('--config', function () {
    var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dst);
    var outputIndex = path.join(dst, 'index.html');
    return documentation(['build -c fixture/html/documentation.yml -f html fixture/html/nested.input.js -o ' +
      dst], {}, false).then(() => {
        var expectedOutput = fs.readFileSync(outputIndex, 'utf8');
        expect(expectedOutput).toMatchSnapshot();
      });
  });

  it('--version', function () {
    return documentation(['--version'], {}, false).then(output => {
      expect(output).toBeTruthy();
    });
  });

  describe('lint command', function () {

    it('generates lint output', function () {
      return documentation(['lint fixture/lint/lint.input.js']).then(data => {
        data = data.toString().split('\n').slice(2).join('\n');
        expect(data).toMatchSnapshot();
      });
    });

    it('generates no output on a good file', function () {
      documentation(['lint fixture/simple.input.js'], {}, false).then(data => {
        expect(data).toBe('');
      });
    });

    it('exposes syntax error on a bad file', function () {
      documentation(['lint fixture/bad/syntax.input.js'], {}, false).catch(err => {
        expect(err.code > 0).toBeTruthy();
      });
    });

    it('lint with no inputs', function () {
      documentation(['lint'], {
        cwd: path.join(__dirname, 'fixture/bad')
      }, false).catch(err => {
        expect(err.code > 0).toBeTruthy();
      });
    });
  });

  it('given no files', function () {
    return documentation(['build']).catch(function (err) {
      expect(err.toString()
        .match(/documentation was given no files and was not run in a module directory/)).toBeTruthy();
    });
  });

  it('with an invalid command', function () {
    return documentation(['invalid'], {}, false).catch(function (err) {
      expect(err).toBeTruthy();
    });
  });

  it('--access flag', function () {
    return documentation(['build --shallow fixture/internal.input.js -a public'], {}, false)
      .then(data => {
        expect(data).toBe('[]');
      });
  });

  it('--private flag', function () {
    return documentation(['build fixture/internal.input.js --private'], {}).then(data => {
      expect(data.length > 2).toBeTruthy();
    });
  });

  it('--infer-private flag', function () {
    return documentation(['build fixture/infer-private.input.js --infer-private ^_'], {}, false).then(data => {
      // This uses JSON.parse with a reviver used as a visitor.
      JSON.parse(data, function (n, v) {
        // Make sure we do not see any names that match `^_`.
        if (n === 'name') {
          expect(typeof v).toBe('string');
          expect(!/_$/.test(v)).toBeTruthy();
        }
        return v;
      });
    });
  });

  it('write to file', function () {

    var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

    return documentation(['build --shallow fixture/internal.input.js -o ' + dst], {}, false).then(data => {
      expect(data).toBe('');
      expect(fs.existsSync(dst)).toBeTruthy();
    });
  });

  it('write to html', function () {

    var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dstDir);

    documentation(['build --shallow fixture/internal.input.js -f html -o ' + dstDir], {}, false)
      .then(data => {
        expect(data).toBe('');
        expect(fs.existsSync(path.join(dstDir, 'index.html'))).toBeTruthy();
      });
  });

  it('write to html with custom theme', function () {

    var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dstDir);

    return documentation(['build -t fixture/custom_theme --shallow fixture/internal.input.js -f html -o ' + dstDir],
      {}, false)
      .then(data => {
        expect(data).toBe('');
        expect(fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8')).toBeTruthy();
      });
  });

  it('write to html, highlightAuto', function () {

    var fixture = 'fixture/auto_lang_hljs/multilanguage.input.js',
      config = 'fixture/auto_lang_hljs/config.yml',
      dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

    fs.mkdirSync(dstDir);

    return documentation(['build --shallow ' + fixture + ' -c ' + config + ' -f html -o ' + dstDir], {}, false)
      .catch(err => {
        var result = fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8');
        expect(result.indexOf('<span class="hljs-number">42</span>') > 0).toBeTruthy();
        expect(result.indexOf('<span class="hljs-selector-attr">[data-foo]</span>') > 0).toBeTruthy();
        expect(result.indexOf('<span class="hljs-attr">data-foo</span>') > 0).toBeTruthy();
      });
  });

  it('fatal error', function () {

    return documentation(['build --shallow fixture/bad/syntax.input.js'], {}, false)
      .catch(err => {
        expect(err.toString().match(/Unexpected token/)).toBeTruthy();
      });
  });

  it('build --document-exported', function () {

    return documentation(['build fixture/document-exported.input.js --document-exported -f md'], {}, false)
      .then(data => {
        expect(data).toMatchSnapshot();
      });
  });

  it('build large file without error (no deoptimized styling error)', function () {

    var dstFile = path.join(os.tmpdir(), (Date.now() + Math.random()).toString()) + '.js';
    var contents = '';
    for (var i = 0; i < 4e4; i++) {
      contents += '/* - */\n';
    }
    fs.writeFileSync(dstFile, contents, 'utf8');

    return documentation(['build ' + dstFile], {}, function (err, data, stderr) {
      fs.unlinkSync(dstFile);
    });
  });

});
