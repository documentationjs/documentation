'use strict';

var documentationSchema = require('documentation-schema');
var validate = require('json-schema');
var documentation = require('../');
var outputMarkdown = require('../lib/output/markdown.js');
var outputMarkdownAST = require('../lib/output/markdown_ast.js');
var outputHtml = require('../lib/output/html.js');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var chdir = require('chdir');
var walk = require('../lib/walk');

function normalize(comments) {
  return walk(comments, function (comment) {
    var hasGithub = !!comment.context.github;
    var path = comment.context.path;
    comment.context = {
      loc: comment.context.loc
    };
    if (hasGithub) {
      comment.context.github = '[github]';
    }
    if (path) {
      comment.context.path = path;
    }
  });
}

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
  it('git option', function (done) {
    var file = path.join(__dirname, './fixture/simple.input.js');
    documentation.build([file], { github: true }).then(result => {
      normalize(result);
      expect(result).toMatchSnapshot();

      outputMarkdown(result, {}).then(result => {
        expect(result.toString()).toMatchSnapshot();
        done();
      });
    });
  });
}

it('document-exported error', function (done) {
  var file = path.join(__dirname, 'fixture', 'document-exported-bad', 'x.js');
  documentation.build([file], { documentExported: true }).then(result => {
  }, err => {
    expect(err.message).toMatch(/Unable to find the value x/g, 'Produces a descriptive error');
    done();
  });
});

it('external modules option', function (done) {
  documentation.build([
    path.join(__dirname, 'fixture', 'external.input.js')
  ], {
    external: '(external|external/node_modules/*)'
  }).then(result => {
    normalize(result);
    expect(result).toMatchSnapshot();
    done();
  });
});

it('bad input', function (done) {
  glob.sync(path.join(__dirname, 'fixture/bad', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function (done) {
      documentation.build([file], readOptionsFromFile(file)).then(res => {
        expect(res).toBe(undefined);
      }).catch(error => {
        // make error a serializable object
        error = JSON.parse(JSON.stringify(error));
        // remove system-specific path
        delete error.filename;
        delete error.codeFrame;
        expect(error).toMatchSnapshot();
        done();
      });
    });
  });
  done();
});

it('html', function (done) {
  glob.sync(path.join(__dirname, 'fixture/html', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function (t) {
      documentation.build([file], readOptionsFromFile(file))
        .then(result => outputHtml(result, {}))
        .then(result => {
          var clean = result.sort((a, b) => a.path > b.path)
            .filter(r => r.path.match(/(html)$/))
            .map(r => r.contents)
            .join('\n');
          expect(clean).toMatchSnapshot();
          done();
        })
        .catch(err => {
          done.fail(err);
        });
    });
  });
  done();
});

it('outputs', function (done) {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function (tt) {
      documentation.build([file], readOptionsFromFile(file)).then(result => {

        tt.test('markdown', function (t) {
          outputMarkdown(_.cloneDeep(result), { markdownToc: true }).then(result => {
            expect(result.toString()).toMatchSnapshot();
            done();
          }).catch(error => expect(error).toBeFalsy());
        });

        if (file.match(/es6.input.js/)) {
          tt.test('no markdown TOC', function (t) {
            outputMarkdown(_.cloneDeep(result), { markdownToc: false }).then(result => {
              expect(result.toString()).toMatchSnapshot();
              done();
            }).catch(error => expect(error).toBeFalsy());
          });
        }

        tt.test('markdown AST', function (t) {
          outputMarkdownAST(_.cloneDeep(result), {}).then(result => {
            expect(result).toMatchSnapshot();
            done();
          }).catch(error => expect(error).toBeFalsy());
        });

        tt.test('JSON', function (t) {
          normalize(result);
          result.forEach(function (comment) {
            validate(comment, documentationSchema.jsonSchema).errors.forEach(function (error) {
              expect(error).toBeFalsy();
            });
          });
          expect(makePOJO(result)).toMatchSnapshot();
        });

        done();
      });
    });
  });
  done();
});

it('highlightAuto md output', function (done) {
  var file = path.join(__dirname, 'fixture/auto_lang_hljs/multilanguage.input.js'),
    hljsConfig = {hljs: {highlightAuto: true, languages: ['js', 'css', 'html']}};

  documentation.build(file, {}).then(result => {
    outputMarkdown(result, hljsConfig).then(result => {
      expect(result.toString()).toMatchSnapshot();
      done();
    });
  });
});

it('config', function (done) {
  var file = path.join(__dirname, 'fixture', 'class.input.js');
  var outputfile = path.join(__dirname, 'fixture', 'class.config.output.md');
  documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'simple.config.yml')
  }).then(out => outputMarkdown(out, {}))
    .then(md => {
      expect(md).toMatchSnapshot();
      done();
    })
    .catch(err => {
      done.fail(err);
    });
});

it('multi-file input', function (done) {
  documentation.build([
    path.join(__dirname, 'fixture', 'simple.input.js'),
    path.join(__dirname, 'fixture', 'simple-two.input.js')
  ], {}).then(result => {
    normalize(result);
    expect(result).toMatchSnapshot();
    done();
  });
});

it('accepts simple relative paths', function (done) {
  chdir(__dirname, function () {
    documentation.build('test/fixture/simple.input.js', {}).then(data => {
      expect(data.length).toBe(1);
      done();
    });
  });
});

it('.lint', function (done) {
  chdir(__dirname, function () {
    documentation.lint('test/fixture/simple.input.js', {}).then(data => {
      expect(data).toBe('');
      done();
    });
  });
});

it('.lint with bad input', function (done) {
  chdir(__dirname, function () {
    documentation.lint('test/fixture/bad/syntax.input.js', {}).catch(err => {
      expect(err).toBeTruthy();
      done();
    });
  });
});
