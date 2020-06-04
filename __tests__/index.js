const documentation = require('../src/');
const os = require('os');
const path = require('path');
const fs = require('fs');

function inputs(contents) {
  const dirEntry = os.tmpdir();
  const paths = {};
  for (const filename in contents) {
    paths[filename] = path.join(dirEntry, '/', filename);
    fs.writeFileSync(paths[filename], contents[filename]);
  }
  return {
    paths
  };
}

function cleanup(comments) {
  comments.forEach(c => {
    delete c.context;
  });
}

test('lint', async function () {
  const { paths } = inputs({
    'index.js': '/** hi */var name = 1;'
  });

  const data = await documentation.lint([paths['index.js']], {});
  expect(data).toEqual('');
});

test('build', async function () {
  const { paths } = inputs({
    'index.js': '/** hi */var name = 1;'
  });

  const data = await documentation.build([paths['index.js']], {});
  cleanup(data);
  expect(data).toMatchSnapshot();

  const md = await documentation.formats.md(data);
  expect(md).toMatchSnapshot();

  const json = await documentation.formats.json(data, {});
  expect(json).toMatchSnapshot();
});

test('expandInputs', async function () {
  const { paths } = inputs({
    'index.js': '/** hi */var name = 1;'
  });

  {
    const data = await documentation.expandInputs([paths['index.js']], {
      parseExtension: ['js']
    });
    expect(data.length).toEqual(1);
  }

  {
    const data = await documentation.expandInputs([paths['index.js']], {
      parseExtension: ['js'],
      shallow: true
    });
    expect(data.length).toEqual(1);
  }
});
