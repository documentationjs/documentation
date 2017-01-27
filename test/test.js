'use strict';

var test = require('tap').test,
  documentationSchema = require('documentation-schema'),
  validate = require('json-schema'),
  documentation = require('../'),
  outputMarkdown = require('../lib/output/markdown.js'),
  outputMarkdownAST = require('../lib/output/markdown_ast.js'),
  outputHtml = require('../lib/output/html.js'),
  normalize = require('./normalize'),
  glob = require('glob'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  chdir = require('chdir');

var UPDATE = !!process.env.UPDATE;

function makePOJO(ast) {
  return JSON.parse(JSON.stringify(ast));
}

function readOptionsFromFile(file) {
  var s = fs.readFileSync(file, 'utf-8');
  var lines = s.split(/\n/, 20);
  for (var i = 0; i < lines.length; i++) {
    var m = lines[i].match(/^\/\/\s+Options:\s*(.+)$/);
    if (m) {
      return JSON.parse(m[1]);
    }
  }
  return {};
}

if (fs.existsSync(path.join(__dirname, '../.git'))) {
  test('git option', function (t) {
    var file = path.join(__dirname, './fixture/simple.input.js');
    documentation.build([file], { github: true }).then(result => {
      normalize(result);
      var outputfile = file.replace('.input.js', '.output.github.json');
      if (UPDATE) {
        fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
      }
      var expect = require(outputfile);
      t.deepEqual(result, expect, 'produces correct JSON');

      outputMarkdown(result, {}).then(result => {
        var outputfile = file.replace('.input.js', '.output.github.md');
        if (UPDATE) {
          fs.writeFileSync(outputfile, result, 'utf8');
        }
        var expect = fs.readFileSync(outputfile, 'utf8');
        t.equal(result.toString(), expect, 'markdown output correct');
        t.end();
      });
    });
  });
}

test('document-exported error', function (t) {
  var file = path.join(__dirname, 'fixture', 'document-exported-bad', 'x.js');
  documentation.build([file], { documentExported: true }).then(result => {
  }, err => {
    t.match(err.message, /Unable to find the value x/g, 'Produces a descriptive error');
    t.end();
  });
});

test('external modules option', function (t) {
  documentation.build([
    path.join(__dirname, 'fixture', 'external.input.js')
  ], {
    external: '(external|external/node_modules/*)'
  }).then(result => {
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_external-deps-included.json');
    if (UPDATE) {
      fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    }
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  });
});

test('bad input', function (tt) {
  glob.sync(path.join(__dirname, 'fixture/bad', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation.build([file], readOptionsFromFile(file)).then(res => {
        t.equal(res, undefined);
      }).catch(error => {
        // make error a serializable object
        error = JSON.parse(JSON.stringify(error));
        // remove system-specific path
        delete error.filename;
        delete error.codeFrame;
        var outputfile = file.replace('.input.js', '.output.json');
        if (UPDATE) {
          fs.writeFileSync(outputfile, JSON.stringify(error, null, 2));
        }
        var expect = JSON.parse(fs.readFileSync(outputfile));
        t.deepEqual(error, expect);
        t.end();
      });
    });
  });
  tt.end();
});

test('html', function (tt) {
  glob.sync(path.join(__dirname, 'fixture/html', '*.input.js')).forEach(function (file) {
    tt.test(path.basename(file), function (t) {
      documentation.build([file], readOptionsFromFile(file))
        .then(result => outputHtml(result, {}))
        .then(result => {
          var clean = result.sort((a, b) => a.path > b.path)
            .filter(r => r.path.match(/(html)$/))
            .map(r => r.contents)
            .join('\n');
          var outputfile = file.replace('.input.js', '.output.files');
          if (UPDATE) {
            fs.writeFileSync(outputfile, clean, 'utf8');
          }
          var expect = fs.readFileSync(outputfile, 'utf8');
          t.deepEqual(clean, expect);
          t.end();
        })
        .catch(err => {
          t.fail(err);
        });
    });
  });
  tt.end();
});

test('outputs', function (ttt) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    ttt.test(path.basename(file), function (tt) {
      documentation.build([file], readOptionsFromFile(file)).then(result => {

        tt.test('markdown', function (t) {
          outputMarkdown(_.cloneDeep(result), { markdownToc: true }).then(result => {
            var outputfile = file.replace('.input.js', '.output.md');
            if (UPDATE) {
              fs.writeFileSync(outputfile, result, 'utf8');
            }
            var expect = fs.readFileSync(outputfile, 'utf8');
            t.equal(result.toString(), expect, 'markdown output correct');
            t.end();
          }).catch(error => t.ifError(error));
        });

        if (file.match(/es6.input.js/)) {
          tt.test('no markdown TOC', function (t) {
            outputMarkdown(_.cloneDeep(result), { markdownToc: false }).then(result => {
              var outputfile = file.replace('.input.js', '.output-toc.md');
              if (UPDATE) {
                fs.writeFileSync(outputfile, result, 'utf8');
              }
              var expect = fs.readFileSync(outputfile, 'utf8');
              t.equal(result.toString(), expect, 'markdown output correct');
              t.end();
            }).catch(error => t.ifError(error));
          });
        }

        tt.test('markdown AST', function (t) {
          outputMarkdownAST(_.cloneDeep(result), {}).then(result => {
            var outputfile = file.replace('.input.js', '.output.md.json');
            if (UPDATE) {
              fs.writeFileSync(outputfile, JSON.stringify(result, null, 2), 'utf8');
            }
            var expect = JSON.parse(fs.readFileSync(outputfile, 'utf8'));
            t.deepEqual(result, expect, 'markdown AST output correct');
            t.end();
          }).catch(error => t.ifError(error));
        });

        tt.test('JSON', function (t) {
          normalize(result);
          result.forEach(function (comment) {
            validate(comment, documentationSchema.jsonSchema).errors.forEach(function (error) {
              t.ifError(error);
            });
          });
          var outputfile = file.replace('.input.js', '.output.json');
          if (UPDATE) {
            fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
          }
          var expect = require(outputfile);
          t.deepEqual(makePOJO(result), expect);
          t.end();
        });

        tt.end();
      });
    });
  });
  ttt.end();
});

test('highlightAuto md output', function (t) {
  var file = path.join(__dirname, 'fixture/auto_lang_hljs/multilanguage.input.js'),
    hljsConfig = {hljs: {highlightAuto: true, languages: ['js', 'css', 'html']}};

  documentation.build(file, {}).then(result => {
    outputMarkdown(result, hljsConfig).then(result => {
      var outputfile = file.replace('.input.js', '.output.md');
      if (UPDATE) {
        fs.writeFileSync(outputfile, result, 'utf8');
      }
      var expect = fs.readFileSync(outputfile, 'utf8');
      t.equal(result.toString(), expect, 'recognizes examples in html, css and js');
      t.end();
    });
  });
});

test('config', function (t) {
  var file = path.join(__dirname, 'fixture', 'class.input.js');
  var outputfile = path.join(__dirname, 'fixture', 'class.config.output.md');
  documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'simple.config.yml')
  }).then(out => outputMarkdown(out, {}))
    .then(md => {
      if (UPDATE) {
        fs.writeFileSync(outputfile, md);
      }
      var result = fs.readFileSync(outputfile, 'utf8');

      t.equal(md, result, 'rendered markdown is equal');
      t.end();
    })
    .catch(err => {
      t.fail(err);
    });
});

test('multi-file input', function (t) {
  documentation.build([
    path.join(__dirname, 'fixture', 'simple.input.js'),
    path.join(__dirname, 'fixture', 'simple-two.input.js')
  ], {}).then(result => {
    normalize(result);
    var outputfile = path.join(__dirname, 'fixture', '_multi-file-input.json');
    if (UPDATE) {
      fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
    }
    var expect = require(outputfile);
    t.deepEqual(result, expect);
    t.end();
  });
});

test('accepts simple relative paths', function (t) {
  chdir(__dirname, function () {
    documentation.build('test/fixture/simple.input.js', {}).then(data => {
      t.equal(data.length, 1, 'simple has no dependencies');
      t.end();
    });
  });
});

test('.lint', function (t) {
  chdir(__dirname, function () {
    documentation.lint('test/fixture/simple.input.js', {}).then(data => {
      t.equal(data, '', 'outputs lint information');
      t.end();
    });
  });
});

test('.lint with bad input', function (t) {
  chdir(__dirname, function () {
    documentation.lint('test/fixture/bad/syntax.input.js', {}).catch(err => {
      t.ok(err, 'returns an error when syntax is incorrect');
      t.end();
    });
  });
});
