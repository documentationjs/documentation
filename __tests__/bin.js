/* global jasmine */

const path = require('path');
const os = require('os');
const exec = require('child_process').exec;
const tmp = require('tmp');
const fs = require('fs-extra');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

function documentation(args, options, parseJSON) {
  if (!options) {
    options = {};
  }
  if (!options.cwd) {
    options.cwd = __dirname;
  }

  options.maxBuffer = 1024 * 1024;

  args.unshift('node ' + path.join(__dirname, '..', 'bin', 'documentation.js'));

  return new Promise((resolve, reject) => {
    exec(args.join(' '), options, function (err, stdout, stderr) {
      if (err) {
        err.stderr = stderr;
        return reject(err);
      }
      if (parseJSON === false) {
        resolve(stdout);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(e);
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

test.skip('documentation binary', async function () {
  const data = await documentation(['build fixture/simple.input.js'], {});
  expect(data.length).toBe(1);
});

test.skip('defaults to parsing package.json main', async function () {
  const data = await documentation(['build'], {
    cwd: path.join(__dirname, '..')
  });
  expect(data.length).toBeTruthy();
});

test.skip('accepts config file', async function () {
  const data = await documentation([
    'build fixture/sorting/input.js -c fixture/config.json'
  ]);
  expect(normalize(data)).toMatchSnapshot();
});

test.skip('accepts config file - reports failures', async function () {
  try {
    await documentation(
      ['build fixture/sorting/input.js -c fixture/config-bad.yml'],
      {},
      false
    );
  } catch (stderr) {
    expect(stderr).toMatchSnapshot();
  }
});

test.skip('accepts config file - reports parse failures', async function () {
  try {
    await documentation(
      ['build fixture/sorting/input.js -c fixture/config-malformed.json'],
      {},
      false
    );
  } catch (stderr) {
    expect(stderr.stderr.match(/SyntaxError/g)).toBeTruthy();
  }
});

test.skip('--shallow option', async function () {
  const data = await documentation([
    'build --shallow fixture/internal.input.js'
  ]);
  expect(data.length).toBe(0);
});

test.skip('external modules option', async function () {
  const data = await documentation([
    'build fixture/external.input.js ' +
      '--external=external --external=external/node_modules'
  ]);
  expect(data.length).toBe(2);
});

test.skip('when a file is specified both in a glob and explicitly, it is only documented once', async function () {
  const data = await documentation([
    'build fixture/simple.input.js fixture/simple.input.*'
  ]);
  expect(data.length).toBe(1);
});

test.skip('extension option', async function () {
  const data = await documentation([
    'build fixture/extension/index.otherextension ' +
      '--requireExtension=otherextension --parseExtension=otherextension'
  ]);
  expect(data.length).toBe(1);
});

test.skip('extension option', function () {
  return documentation(['build fixture/extension.jsx']);
});

describe('invalid arguments', function () {
  test.skip('bad -f option', async function () {
    try {
      await documentation(
        ['build -f DOES-NOT-EXIST fixture/internal.input.js'],
        {},
        false
      );
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test.skip('html with no destination', async function () {
    try {
      await documentation(['build -f html fixture/internal.input.js']);
    } catch (err) {
      expect(
        err
          .toString()
          .match(
            /The HTML output mode requires a destination directory set with -o/
          )
      ).toBeTruthy();
    }
  });

  test.skip('bad command', async function () {
    try {
      await documentation(['-f html fixture/internal.input.js'], {}, false);
    } catch (err) {
      expect(err.code).toBeTruthy();
    }
  });
});

const semver = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi;
test.skip('--config', async function () {
  const dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());
  fs.mkdirSync(dst);
  const outputIndex = path.join(dst, 'index.html');
  const data = await documentation(
    [
      'build -c fixture/html/documentation.yml -f html fixture/html/nested.input.js -o ' +
        dst
    ],
    {},
    false
  );
  let output = fs.readFileSync(outputIndex, 'utf8');
  const version = require('../package.json').version;
  output = output.replace(new RegExp(version.replace(/\./g, '\\.'), 'g'), '');
  expect(output).toMatchSnapshot();
});

test.skip('--version', async function () {
  const output = await documentation(['--version'], {}, false);
  expect(output).toBeTruthy();
});

describe('lint command', function () {
  test.skip('generates lint output', async function () {
    try {
      await documentation(['lint fixture/lint/lint.input.js'], {}, false);
    } catch (err) {
      const data = err.stderr.toString().split('\n').slice(2).join('\n');
      expect(data).toMatchSnapshot();
    }
  });

  test.skip('generates no output on a good file', async function () {
    const data = await documentation(
      ['lint fixture/simple.input.js'],
      {},
      false
    );
    expect(data).toBe('');
  });

  test.skip('exposes syntax error on a bad file', async function () {
    try {
      await documentation(
        ['lint fixture/bad/syntax.input', '--parseExtension input'],
        {},
        false
      );
    } catch (err) {
      expect(err.code > 0).toBeTruthy();
    }
  });

  test.skip('lint with no inputs', async function () {
    try {
      await documentation(
        ['lint'],
        {
          cwd: path.join(__dirname, 'fixture/bad')
        },
        false
      );
    } catch (err) {
      expect(err.code > 0).toBeTruthy();
    }
  });

  test.skip('generates lint output with shallow', async function () {
    const data = await documentation(
      ['lint fixture/lint/lint.input.shallow.js --shallow'],
      {},
      false
    );
    expect(data).toBe('');
  });
});

test.skip('given no files', async function () {
  try {
    await documentation(['build']);
  } catch (err) {
    expect(
      err
        .toString()
        .match(
          /documentation was given no files and was not run in a module directory/
        )
    ).toBeTruthy();
  }
});

test.skip('with an invalid command', async function () {
  try {
    await documentation(['invalid'], {}, false);
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

test.skip('--access flag', async function () {
  const data = await documentation(
    ['build --shallow fixture/internal.input.js -a public'],
    {},
    false
  );
  expect(data).toBe('[]');
});

test.skip('--private flag', async function () {
  const data = await documentation(
    ['build fixture/internal.input.js --private'],
    {},
    false
  );
  expect(data.length > 2).toBeTruthy();
});

test.skip('--infer-private flag', async function () {
  const data = await documentation(
    ['build fixture/infer-private.input.js --infer-private ^_'],
    {},
    false
  );
  // This uses JSON.parse with a reviver used as a visitor.
  JSON.parse(data, function (n, v) {
    // Make sure we do not see any names that match `^_`.
    if (n === 'name') {
      expect(typeof v).toBe('string');
      expect(!/_$/.test.skip(v)).toBeTruthy();
    }
    return v;
  });
});

test.skip('write to file', async function () {
  const dst = path.join(os.tmpdir(), (Date.now() + Math.random()).toString());

  const data = await documentation(
    ['build --shallow fixture/internal.input.js -o ' + dst],
    {},
    false
  );
  expect(data).toBe('');
  expect(fs.existsSync(dst)).toBeTruthy();
});

test.skip('write to html', async function () {
  const dstDir = path.join(
    os.tmpdir(),
    (Date.now() + Math.random()).toString()
  );
  fs.mkdirSync(dstDir);

  const data = await documentation(
    ['build --shallow fixture/internal.input.js -f html -o ' + dstDir],
    {},
    false
  );
  expect(data).toBe('');
  expect(fs.existsSync(path.join(dstDir, 'index.html'))).toBeTruthy();
});

test.skip('write to html with custom theme', async function () {
  const dstDir = path.join(
    os.tmpdir(),
    (Date.now() + Math.random()).toString()
  );
  fs.mkdirSync(dstDir);

  const data = await documentation(
    [
      'build -t fixture/custom_theme --shallow fixture/internal.input.js -f html -o ' +
        dstDir
    ],
    {},
    false
  );
  expect(data).toBe('');
  expect(fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8')).toBeTruthy();
});

test.skip('write to html, highlightAuto', function () {
  const fixture = 'fixture/auto_lang_hljs/multilanguage.input.js';
  const config = 'fixture/auto_lang_hljs/config.yml';
  const dstDir = path.join(
    os.tmpdir(),
    (Date.now() + Math.random()).toString()
  );

  fs.mkdirSync(dstDir);

  return documentation(
    ['build --shallow ' + fixture + ' -c ' + config + ' -f html -o ' + dstDir],
    {},
    false
  ).then(() => {
    const result = fs.readFileSync(path.join(dstDir, 'index.html'), 'utf8');
    expect(
      result.indexOf('<span class="hljs-number">42</span>') > 0
    ).toBeTruthy();
    expect(
      result.indexOf('<span class="hljs-selector-attr">[data-foo]</span>') > 0
    ).toBeTruthy();
    expect(
      result.indexOf('<span class="hljs-attr">data-foo</span>') > 0
    ).toBeTruthy();
  });
});

test.skip('fatal error', async function () {
  try {
    await documentation(
      ['build --shallow fixture/bad/syntax.input --parseExtension input'],
      {},
      false
    );
  } catch (err) {
    expect(err.toString().match(/Unexpected token/)).toBeTruthy();
  }
});

test.skip('build --document-exported', async function () {
  const data = await documentation(
    ['build fixture/document-exported.input.js --document-exported -f md'],
    {},
    false
  );
  expect(data).toMatchSnapshot();
});

test.skip('build large file without error (no deoptimized styling error)', function () {
  const dstFile =
    path.join(os.tmpdir(), (Date.now() + Math.random()).toString()) + '.js';
  let contents = '';
  for (let i = 0; i < 4e4; i++) {
    contents += '/* - */\n';
  }
  fs.writeFileSync(dstFile, contents, 'utf8');

  return documentation(['build ' + dstFile], {}, false).then(() => {
    fs.unlinkSync(dstFile);
  });
});

test.skip('should use browser resolve', async function () {
  const data = await documentation(['build fixture/resolve/index.js']);
  expect(normalize(data)).toMatchSnapshot();
});

test.skip('should use node resolve', async function () {
  const data = await documentation([
    'build fixture/resolve/index.js --resolve node'
  ]);
  expect(normalize(data)).toMatchSnapshot();
});
