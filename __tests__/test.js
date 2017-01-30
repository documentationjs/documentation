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
var pify = require('pify');
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
  it('git option', function () {
    var file = path.join(__dirname, './fixture/simple.input.js');
    return documentation.build([file], { github: true }).then(result => {
      normalize(result);
      expect(result).toMatchSnapshot();

      return outputMarkdown(result, {}).then(result => {
        expect(result.toString()).toMatchSnapshot();
      });
    });
  });
}

it('document-exported error', function () {
  var file = path.join(__dirname, 'fixture', 'document-exported-bad', 'x.js');
  return documentation.build([file], { documentExported: true }).then(result => {
  }, err => {
    expect(err.message).toMatch(/Unable to find the value x/g, 'Produces a descriptive error');
  });
});

it('external modules option', function () {
  return documentation.build([
    path.join(__dirname, 'fixture', 'external.input.js')
  ], {
    external: '(external|external/node_modules/*)'
  }).then(result => {
    normalize(result);
    expect(result).toMatchSnapshot();
  });
});

it('bad input', function () {
  glob.sync(path.join(__dirname, 'fixture/bad', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function () {
      return documentation.build([file], readOptionsFromFile(file)).then(res => {
        expect(res).toBe(undefined);
      }).catch(error => {
        // make error a serializable object
        error = JSON.parse(JSON.stringify(error));
        // remove system-specific path
        delete error.filename;
        delete error.codeFrame;
        expect(error).toMatchSnapshot();
      });
    });
  });
});

it('html', function () {
  glob.sync(path.join(__dirname, 'fixture/html', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function () {
      return documentation.build([file], readOptionsFromFile(file))
        .then(result => outputHtml(result, {}))
        .then(result => {
          var clean = result.sort((a, b) => a.path > b.path)
            .filter(r => r.path.match(/(html)$/))
            .map(r => r.contents)
            .join('\n');
          expect(clean).toMatchSnapshot();
        });
    });
  });
});

describe('outputs', function () {
  glob.sync(path.join(__dirname, 'fixture', '*.input.js')).forEach(function (file) {
    it(path.basename(file), function () {
      return documentation.build([file], readOptionsFromFile(file)).then(result => {

        it('markdown', function () {
          return outputMarkdown(_.cloneDeep(result), { markdownToc: true }).then(result => {
            expect(result.toString()).toMatchSnapshot();
          }).catch(error => expect(error).toBeFalsy());
        });

        if (file.match(/es6.input.js/)) {
          it('no markdown TOC', function () {
            return outputMarkdown(_.cloneDeep(result), { markdownToc: false }).then(result => {
              expect(result.toString()).toMatchSnapshot();
            }).catch(error => expect(error).toBeFalsy());
          });
        }

        it('markdown AST', function () {
          return outputMarkdownAST(_.cloneDeep(result), {}).then(result => {
            expect(result).toMatchSnapshot();
          }).catch(error => expect(error).toBeFalsy());
        });

        it('JSON', function () {
          normalize(result);
          result.forEach(function (comment) {
            validate(comment, documentationSchema.jsonSchema).errors.forEach(function (error) {
              expect(error).toBeFalsy();
            });
          });
          expect(makePOJO(result)).toMatchSnapshot();
        });
      });
    });
  });
});

it('highlightAuto md output', function () {
  var file = path.join(__dirname, 'fixture/auto_lang_hljs/multilanguage.input.js'),
    hljsConfig = {hljs: {highlightAuto: true, languages: ['js', 'css', 'html']}};

  return documentation.build(file, {}).then(result => {
    return outputMarkdown(result, hljsConfig).then(result => {
      expect(result.toString()).toMatchSnapshot();
    });
  });
});

it('config', function () {
  var file = path.join(__dirname, 'fixture', 'class.input.js');
  var outputfile = path.join(__dirname, 'fixture', 'class.config.output.md');
  return documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'simple.config.yml')
  }).then(out => outputMarkdown(out, {}))
    .then(md => {
      expect(md).toMatchSnapshot();
    });
});

it('multi-file input', function () {
  return documentation.build([
    path.join(__dirname, 'fixture', 'simple.input.js'),
    path.join(__dirname, 'fixture', 'simple-two.input.js')
  ], {}).then(result => {
    normalize(result);
    expect(result).toMatchSnapshot();
  });
});

it('accepts simple relative paths', function () {
  return pify(chdir)(__dirname).then(function () {
    return documentation.build('test/fixture/simple.input.js', {}).then(data => {
      expect(data.length).toBe(1);
    });
  });
});

it('.lint', function () {
  return pify(chdir)(__dirname).then(function () {
    return documentation.lint('test/fixture/simple.input.js', {}).then(data => {
      expect(data).toBe('');
    });
  });
});

it('.lint with bad input', function () {
  return pify(chdir)(__dirname).then(function () {
    return documentation.lint('test/fixture/bad/syntax.input.js', {}).catch(err => {
      expect(err).toBeTruthy();
    });
  });
});
