'use strict';

var path = require('path'), os = require('os'), exec = require('child_process').exec, tmp = require('tmp'), fs = require('fs-extra');

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

describe('binary', function () {
  it('documentation binary', function (done) {
    documentation(['build fixture/simple.input.js'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(1);
      done();
    });
  });

  it('defaults to parsing package.json main', function (done) {
    documentation(['build'], { cwd: path.join(__dirname, '..') }, function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBeTruthy();
      done();
    });
  });

  it('polyglot mode', function (done) {
    documentation(['build fixture/polyglot/blend.cpp --polyglot'],
      function (err, data) {
        expect(err).toBeFalsy();
        expect(normalize(data)).toMatchSnapshot();
        done();
      });
  });

  it('accepts config file', function (done) {
    documentation(['build fixture/sorting/input.js -c fixture/config.json'],
      function (err, data) {
        expect(err).toBeFalsy();
        expect(normalize(data)).toMatchSnapshot();
        done();
      });
  });

  it('accepts config file - reports failures', function (done) {
    documentation(['build fixture/sorting/input.js -c fixture/config-bad.yml'], {},
      function (err, data, stderr) {
        expect(err).toBeFalsy();
        expect(stderr).toMatchSnapshot();
        done();
      }, false);
  });

  it('accepts config file - reports parse failures', function (done) {
    documentation(['build fixture/sorting/input.js -c fixture/config-malformed.json'], {},
      function (err, data, stderr) {
        expect(stderr).toMatch(/SyntaxError/g);
        done();
      }, false);
  });

  it('--shallow option', function (done) {
    documentation(['build --shallow fixture/internal.input.js'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(0);
      done();
    });
  });

  it('external modules option', function (done) {
    documentation(['build fixture/external.input.js ' +
      '--external=external --external=external/node_modules'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(2);
      done();
    });
  });

  it('when a file is specified both in a glob and explicitly, it is only documented once', function (done) {
    documentation(['build fixture/simple.input.js fixture/simple.input.*'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(1);
      done();
    });
  });

  it('extension option', function (done) {
    documentation(['build fixture/extension/index.otherextension ' +
      '--requireExtension=otherextension --parseExtension=otherextension'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(1);
      done();
    });
  });

  /*
   * This tests that parseExtension adds extensions to smartGlob's
   * look through directories.
   */
  it('polyglot + parseExtension + smartGlob', function (done) {
    documentation(['build fixture/polyglot ' +
      '--polyglot --parseExtension=cpp'], function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length).toBe(1);
      done();
    });
  });

  it('extension option', function (done) {
    documentation(['build fixture/extension.jsx'], function (err, data) {
      expect(err).toBeFalsy();
      done();
    });
  });

  describe('invalid arguments', function () {
    it('bad -f option', function (done) {
      documentation(['build -f DOES-NOT-EXIST fixture/internal.input.js'], {}, function (err) {
        expect(err).toBeTruthy();
        done();
      }, false);
    });

    it('html with no destination', function (done) {
      documentation(['build -f html fixture/internal.input.js'], function (err) {
        expect(err.toString()
          .match(/The HTML output mode requires a destination directory set with -o/)).toBeTruthy();
        done();
      });
    });

    it('bad command', function (done) {
      documentation(['-f html fixture/internal.input.js'], {}, function (err, stdout, stderr) {
        expect(err.code).toBeTruthy();
        done();
      }, false);
    });

  });

  it('--config', function (done) {
    var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dst);
    var outputIndex = path.join(dst, 'index.html');
    documentation(['build -c fixture/html/documentation.yml -f html fixture/html/nested.input.js -o ' +
      dst], function (err) {
      expect(err).toBeFalsy();
      var expectedOutput = fs.readFileSync(outputIndex, 'utf8');
      expect(expectedOutput).toMatchSnapshot();
      done();
    }, false);
  });

  it('--version', function (done) {
    documentation(['--version'], {}, function (err, output) {
      expect(output).toBeTruthy();
      done();
    }, false);
  });

  describe('lint command', function () {

    it('generates lint output', function (done) {
      documentation(['lint fixture/lint/lint.input.js'], function (err, data) {
        data = data.toString().split('\n').slice(2).join('\n');
        expect(err.code).toBe(1);
        expect(data).toMatchSnapshot();
        done();
      });
    });

    it('generates no output on a good file', function (done) {
      documentation(['lint fixture/simple.input.js'], {}, function (err, data) {
        expect(err).toBe(null);
        expect(data).toBe('');
        done();
      }, false);
    });

    it('exposes syntax error on a bad file', function (done) {
      documentation(['lint fixture/bad/syntax.input.js'], {}, function (err, data) {
        expect(err.code > 0).toBeTruthy();
        done();
      }, false);
    });

    it('lint with no inputs', function (done) {
      documentation(['lint'], {
        cwd: path.join(__dirname, 'fixture/bad')
      }, function (err, data) {
        expect(err.code > 0).toBeTruthy();
        done();
      }, false);
    });
  });

  it('given no files', function (done) {
    documentation(['build'], function (err) {
      expect(err.toString()
        .match(/documentation was given no files and was not run in a module directory/)).toBeTruthy();
      done();
    });
  });

  it('with an invalid command', function (done) {
    documentation(['invalid'], {}, function (err) {
      expect(err).toBeTruthy();
      done();
    }, false);
  });

  it('--access flag', function (done) {
    documentation(['build --shallow fixture/internal.input.js -a public'], {}, function (err, data) {
      expect(err).toBeFalsy();
      expect(data).toBe('[]');
      done();
    }, false);
  });

  it('--private flag', function (done) {
    documentation(['build fixture/internal.input.js --private'], {}, function (err, data) {
      expect(err).toBeFalsy();
      expect(data.length > 2).toBeTruthy();
      done();
    }, false);
  });

  it('--infer-private flag', function (done) {
    documentation(['build fixture/infer-private.input.js --infer-private ^_'], {}, function (err, data) {
      expect(err).toBeFalsy();

      // This uses JSON.parse with a reviver used as a visitor.
      JSON.parse(data, function (n, v) {
        // Make sure we do not see any names that match `^_`.
        if (n === 'name') {
          expect(typeof v).toBe('string');
          expect(!/_$/.test(v)).toBeTruthy();
        }
        return v;
      });
      done();
    }, false);
  });

  it('write to file', function (done) {

    var dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

    documentation(['build --shallow fixture/internal.input.js -o ' + dst], {}, function (err, data) {
      expect(err).toBeFalsy();
      expect(data).toBe('');
      expect(fs.existsSync(dst)).toBeTruthy();
      done();
    }, false);
  });

  it('write to html', function (done) {

    var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dstDir);

    documentation(['build --shallow fixture/internal.input.js -f html -o ' + dstDir], {},
      function (err, data) {
        expect(err).toBeFalsy();
        expect(data).toBe('');
        expect(fs.existsSync(path.join(dstDir, 'index.html'))).toBeTruthy();
        done();
      }, false);
  });

  it('write to html with custom theme', function (done) {

    var dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
    fs.mkdirSync(dstDir);

    documentation(['build -t fixture/custom_theme --shallow fixture/internal.input.js -f html -o ' + dstDir], {},
      function (err, data) {
        expect(err).toBeFalsy();
        expect(data).toBe('');
        expect(fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8')).toBeTruthy();
        done();
      }, false);
  });

  it('write to html, highlightAuto', function (done) {

    var fixture = 'fixture/auto_lang_hljs/multilanguage.input.js',
      config = 'fixture/auto_lang_hljs/config.yml',
      dstDir = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

    fs.mkdirSync(dstDir);

    documentation(['build --shallow ' + fixture + ' -c ' + config + ' -f html -o ' + dstDir], {},
      function (err) {
        expect(err).toBeFalsy();
        var result = fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8');
        expect(result.indexOf('<span class="hljs-number">42</span>') > 0).toBeTruthy();
        expect(result.indexOf('<span class="hljs-selector-attr">[data-foo]</span>') > 0).toBeTruthy();
        expect(result.indexOf('<span class="hljs-attr">data-foo</span>') > 0).toBeTruthy();
        done();
      }, false);
  });

  it('fatal error', function (done) {

    documentation(['build --shallow fixture/bad/syntax.input.js'], {},
      function (err) {
        expect(err.toString().match(/Unexpected token/)).toBeTruthy();
        done();
      }, false);
  });

  it('build --document-exported', function (done) {

    documentation(['build fixture/document-exported.input.js --document-exported -f md'], {}, function (err, data) {
      expect(err).toBeFalsy();

      expect(data).toMatchSnapshot();
      done();
    }, false);
  });

  it('build large file without error (no deoptimized styling error)', function (done) {

    var dstFile = path.join(os.tmpdir(), (Date.now() + Math.random()).toString()) + '.js';
    var contents = '';
    for (var i = 0; i < 4e4; i++) {
      contents += '/* - */\n';
    }
    fs.writeFileSync(dstFile, contents, 'utf8');

    documentation(['build ' + dstFile], {}, function (err, data, stderr) {
      expect(err).toBeFalsy();
      expect(stderr).toBe('');
      fs.unlinkSync(dstFile);
      done();
    }, false);
  });

});
