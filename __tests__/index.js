var documentation = require('../src/');
var os = require('os');
var path = require('path');
var fs = require('fs');

function inputs(contents) {
  var dirEntry = os.tmpdir();
  var paths = {};
  for (var filename in contents) {
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

test('lint', async function() {
  var { paths } = inputs({
    'index.js': '/** hi */var name = 1;'
  });

  const data = await documentation.lint([paths['index.js']], {});
  expect(data).toEqual('');
});

test('build', async function() {
  var { paths } = inputs({
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

test('expandInputs', async function() {
  var { paths } = inputs({
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
