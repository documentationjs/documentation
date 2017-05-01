var documentationSchema = require('documentation-schema'),
  validate = require('json-schema'),
  documentation = require('../'),
  outputMarkdown = require('../src/output/markdown.js'),
  outputMarkdownAST = require('../src/output/markdown_ast.js'),
  outputHtml = require('../src/output/html.js'),
  normalize = require('./utils').normalize,
  glob = require('glob'),
  pify = require('pify'),
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
  test('git option', async function() {
    var file = path.join(__dirname, './fixture/simple.input.js');
    const result = await documentation.build([file], { github: true });
    normalize(result);
    expect(result).toMatchSnapshot();

    const md = await outputMarkdown(result, {});
    expect(md.toString()).toMatchSnapshot();
  });
}

test('document-exported error', async function() {
  var file = path.join(__dirname, 'fixture', 'document-exported-bad', 'x.js');
  try {
    await documentation.build([file], { documentExported: true });
  } catch (err) {
    expect(err.message.match(/Unable to find the value x/g)).toBeTruthy();
  }
});

test('external modules option', async function() {
  const result = await documentation.build(
    [path.join(__dirname, 'fixture', 'external.input.js')],
    {
      external: '(external|external/node_modules/*)'
    }
  );
  normalize(result);
  var outputfile = path.join(
    __dirname,
    'fixture',
    '_external-deps-included.json'
  );
  expect(result).toMatchSnapshot();
});

test('bad input', function() {
  glob
    .sync(path.join(__dirname, 'fixture/bad', '*.input.js'))
    .forEach(function(file) {
      test(path.basename(file), function(t) {
        return documentation
          .build([file], readOptionsFromFile(file))
          .then(res => {
            expect(res).toBe(undefined);
          })
          .catch(error => {
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

test('html', function() {
  glob
    .sync(path.join(__dirname, 'fixture/html', '*.input.js'))
    .forEach(function(file) {
      test(path.basename(file), async function(t) {
        const result = await documentation.build(
          [file],
          readOptionsFromFile(file)
        );
        const html = await outputHtml(result, {});
        var clean = html
          .sort((a, b) => a.path > b.path)
          .filter(r => r.path.match(/(html)$/))
          .map(r => r.contents)
          .join('\n');
        expect(clean).toMatchSnapshot();
      });
    });
});

test('outputs', function() {
  glob
    .sync(path.join(__dirname, 'fixture', '*.input.js'))
    .forEach(function(file) {
      test(path.basename(file), async function(tt) {
        const result = await documentation.build(
          [file],
          readOptionsFromFile(file)
        );
        test('markdown', async function(t) {
          const md = await outputMarkdown(_.cloneDeep(result), {
            markdownToc: true
          });
          expect(result.toString()).toMatchSnapshot();
        });

        if (file.match(/es6.input.js/)) {
          test('no markdown TOC', async function(t) {
            const txt = await outputMarkdown(_.cloneDeep(result), {
              markdownToc: false
            });
            expect(result.toString()).toMatchSnapshot();
          });
        }

        test('markdown AST', async function(t) {
          const ast = await outputMarkdownAST(_.cloneDeep(result), {});
          expect(ast).toMatchSnapshot();
        });

        test('JSON', function(t) {
          normalize(result);
          result.forEach(function(comment) {
            validate(
              comment,
              documentationSchema.jsonSchema
            ).errors.forEach(function(error) {
              expect(error).toBeFalsy();
            });
          });
          expect(makePOJO(result)).toMatchSnapshot();
        });
      });
    });
});

test('highlightAuto md output', async function() {
  var file = path.join(
    __dirname,
    'fixture/auto_lang_hljs/multilanguage.input.js'
  ),
    hljsConfig = {
      hljs: { highlightAuto: true, languages: ['js', 'css', 'html'] }
    };

  const result = await documentation.build(file, {});
  const md = await outputMarkdown(result, hljsConfig);
  expect(md.toString()).toMatchSnapshot();
});

test('config', async function() {
  var file = path.join(__dirname, 'fixture', 'class.input.js');
  var outputfile = path.join(__dirname, 'fixture', 'class.config.output.md');
  const out = await documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'simple.config.yml')
  });
  const md = await outputMarkdown(out, {});
  expect(md).toMatchSnapshot();
});

test('multi-file input', async function() {
  const result = await documentation.build(
    [
      path.join(__dirname, 'fixture', 'simple.input.js'),
      path.join(__dirname, 'fixture', 'simple-two.input.js')
    ],
    {}
  );
  normalize(result);
  expect(result).toMatchSnapshot();
});

test('accepts simple relative paths', async function() {
  await pify(chdir)(__dirname);
  const data = await documentation.build(
    '__tests__/fixture/simple.input.js',
    {}
  );
  expect(data.length).toBe(1);
});

test('.lint', async function() {
  await pify(chdir)(__dirname);
  const data = await documentation.lint(
    '__tests__/fixture/simple.input.js',
    {}
  );
  expect(data).toBe('');
});

test('.lint with bad input', async function() {
  await pify(chdir)(__dirname);
  try {
    await documentation.lint('__tests__/fixture/bad/syntax.input', {
      parseExtension: ['input']
    });
  } catch (err) {
    expect(err).toBeTruthy();
  }
});
