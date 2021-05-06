const documentationSchema = require('documentation-schema');
const validate = require('json-schema');
const documentation = require('../');
const outputMarkdown = require('../src/output/markdown.js');
const outputMarkdownAST = require('../src/output/markdown_ast.js');
const outputHtml = require('../src/output/html.js');
const normalize = require('./utils').normalize;
const glob = require('glob');
const pify = require('pify');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const chdir = require('chdir');
const config = require('../src/config');

const UPDATE = !!process.env.UPDATE;

function makePOJO(ast) {
  return JSON.parse(JSON.stringify(ast));
}

function readOptionsFromFile(file) {
  const s = fs.readFileSync(file, 'utf-8');
  const lines = s.split(/\n/, 20);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\/\/\s+Options:\s*(.+)$/);
    if (m) {
      return JSON.parse(m[1]);
    }
  }
  return {};
}

beforeEach(function () {
  config.reset();
});

if (fs.existsSync(path.join(__dirname, '../.git'))) {
  test('git option', async function () {
    jest.setTimeout(10000); // 10 second timeout. After update flow.js on 0.56 version the test is executed more time.
    const file = path.join(__dirname, './fixture/simple.input.js');
    const result = await documentation.build([file], { github: true });
    normalize(result);
    expect(result).toMatchSnapshot();

    const md = await outputMarkdown(result, {});
    expect(md.toString()).toMatchSnapshot();
  });
}

test('document-exported error', async function () {
  const file = path.join(__dirname, 'fixture', 'document-exported-bad', 'x.js');
  try {
    await documentation.build([file], { documentExported: true });
  } catch (err) {
    expect(err.message.match(/Unable to find the value x/g)).toBeTruthy();
  }
});

test('external modules option', async function () {
  const result = await documentation.build(
    [path.join(__dirname, 'fixture', 'external.input.js')],
    {
      external: '(external|external/node_modules/*)'
    }
  );
  normalize(result);
  const outputfile = path.join(
    __dirname,
    'fixture',
    '_external-deps-included.json'
  );
  expect(result).toMatchSnapshot();
});

test('bad input', function () {
  glob
    .sync(path.join(__dirname, 'fixture/bad', '*.input.js'))
    .forEach(function (file) {
      test(path.basename(file), function () {
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

describe('html', function () {
  glob
    .sync(path.join(__dirname, 'fixture/html', '*.input.js'))
    .forEach(function (file) {
      test(path.basename(file), async function () {
        const options = readOptionsFromFile(file);
        const result = await documentation.build([file], options);
        const html = await outputHtml(result, {});
        const clean = html
          .sort((a, b) => a.path > b.path)
          .filter(r => r.path.match(/(html)$/))
          .map(r =>
            r.contents
              .toString()
              .replace(/documentation \d+\.\d+\.\d+(-\w+(\.\d+)?)?/g, '')
              .replace(/<code>\d+\.\d+\.\d+(-\w+(\.\d+)?)?<\/code>/g, '')
          )
          .join('\n');
        expect(clean).toMatchSnapshot();
      });
    });
});

describe('outputs', function () {
  glob
    .sync(path.join(__dirname, 'fixture', '*.input.js'))
    .forEach(function (file) {
      describe(path.basename(file), function () {
        let result = null;
        beforeEach(async function () {
          result = await documentation.build([file], readOptionsFromFile(file));
        });

        test('markdown', async function () {
          const md = await outputMarkdown(_.cloneDeep(result), {
            markdownToc: true
          });
          expect(md.toString()).toMatchSnapshot();
        });

        if (file.match(/es6.input.js/)) {
          test('no markdown TOC', async function () {
            const txt = await outputMarkdown(_.cloneDeep(result), {
              markdownToc: false
            });
            expect(result.toString()).toMatchSnapshot();
          });
        }

        test('markdown AST', async function () {
          const ast = await outputMarkdownAST(_.cloneDeep(result), {});
          expect(ast).toMatchSnapshot();
        });

        test('JSON', function () {
          normalize(result);
          result.forEach(function (comment) {
            validate(comment, documentationSchema.jsonSchema).errors.forEach(
              function (error) {
                expect(error).toBeFalsy();
              }
            );
          });
          expect(makePOJO(result)).toMatchSnapshot();
        });
      });
    });
});

test('highlightAuto md output', async function () {
  const file = path.join(
    __dirname,
    'fixture/auto_lang_hljs/multilanguage.input.js'
  );
  const hljsConfig = {
    hljs: { highlightAuto: true, languages: ['js', 'css', 'html'] }
  };

  const result = await documentation.build(file, {});
  const md = await outputMarkdown(result, hljsConfig);
  expect(md.toString()).toMatchSnapshot();
});

test('config', async function () {
  const file = path.join(__dirname, 'fixture', 'class.input.js');
  const outputfile = path.join(__dirname, 'fixture', 'class.config.output.md');
  const out = await documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'simple.config.yml')
  });
  const md = await outputMarkdown(out, {});
  expect(md).toMatchSnapshot();
});

test('config with nested sections', async function () {
  const file = path.join(__dirname, 'fixture', 'sections.input.js');
  const out = await documentation.build([file], {
    config: path.join(__dirname, 'fixture', 'sections.config.yml')
  });
  const md = await outputMarkdown(out, {});
  expect(md).toMatchSnapshot();
});

test('multi-file input', async function () {
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

test('accepts simple relative paths', async function () {
  await pify(chdir)(__dirname);
  const data = await documentation.build(
    '__tests__/fixture/simple.input.js',
    {}
  );
  expect(data.length).toBe(1);
});

test('.lint', async function () {
  await pify(chdir)(__dirname);
  const data = await documentation.lint(
    '__tests__/fixture/simple.input.js',
    {}
  );
  expect(data).toBe('');
});

test('.lint with bad input', async function () {
  await pify(chdir)(__dirname);
  try {
    await documentation.lint('__tests__/fixture/bad/syntax.input', {
      parseExtension: ['input']
    });
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

test('Vue file', async function () {
  await pify(chdir)(__dirname);
  const data = await documentation.build('__tests__/fixture/vue.input.vue', {});
  normalize(data);
  expect(data).toMatchSnapshot();
});

test('Vue file', async function () {
  await pify(chdir)(__dirname);
  const data = await documentation.build(
    '__tests__/fixture/vue-no-script.input.vue',
    {}
  );
  normalize(data);
  expect(data).toMatchSnapshot();
});

test('Use Source attribute only', async function () {
  await pify(chdir)(__dirname);
  const documentationSource = `
/**
 * This Vue Component is a test
 * @returns {vue-tested} vue-tested component
 */
export default {

  props: {

    /**
     * This is a number
     */
    myNumber: {
      default: 42,
      type: Number
    }
  }
}`;
  const data = await documentation.build([{ source: documentationSource }], {
    shallow: true
  });
  normalize(data);
  expect(data).toMatchSnapshot();
});
