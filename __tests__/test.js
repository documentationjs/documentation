import documentationSchema from 'documentation-schema';
import validate from 'json-schema';
import * as documentation from '../src/index';
import outputMarkdown from '../src/output/markdown.js';
import outputMarkdownAST from '../src/output/markdown_ast.js';
import outputHtml from '../src/output/html.js';
import { normalize } from './utils';
import glob from 'glob';
import pify from 'pify';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import chdir from 'chdir';
import config from '../src/config';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const UPDATE = !!process.env.UPDATE;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

test('Check that external modules could parse as input', async function () {
  const dir = path.join(__dirname, 'fixture');
  const result = await documentation.build([
    path.join(dir, 'node_modules', 'external', 'lib', 'main.js'),
    path.join(dir, 'node_modules', 'external2', 'index.js'),
    path.join(dir, 'external.input.js')
  ]);
  normalize(result);
  const outputfile = path.join(dir, '_external-deps-included.json');
  expect(result).toMatchSnapshot();
});

test('Check that plugins are loaded', async function () {
  const initCb = jest.fn();
  const parseCb = jest.fn();
  const mockPlugin = await import('../src/mock_plugin.js');
  mockPlugin.mockInit(initCb, parseCb);

  const dir = path.join(__dirname, 'fixture');
  const result = await documentation.build(
    [path.join(dir, 'simple.input.js'), path.join(dir, 'plugin.txt')],
    { plugin: ['./mock_plugin.js'] }
  );
  normalize(result);
  expect(result).toMatchSnapshot();

  expect(initCb.mock.calls.length).toBe(1);
  expect(parseCb.mock.calls.length).toBe(2);
  expect(
    parseCb.mock.calls[0][0].file.includes('fixture/plugin.txt')
  ).toBeTruthy();
  expect(
    parseCb.mock.calls[1][0].file.includes('fixture/simple.input.js')
  ).toBeTruthy();
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
          .replace(/documentation \d+\.\d+\.\d+(-\w+(\.\d+)?)?/g, '')
          .replace(/<code>\d+\.\d+\.\d+(-\w+(\.\d+)?)?<\/code>/g, '');

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
