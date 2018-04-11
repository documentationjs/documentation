const os = require('os');
const path = require('path');
const fs = require('fs');
const dependency = require('../../../src/input/dependency');

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

test('dependency', async function() {
  const { paths, cleanup } = inputs({
    'index.js': 'module.exports = 1;',
    'requires.js': "module.exports = require('./foo');",
    'foo.js': 'module.exports = 2;'
  });
  {
    const dependencies = await dependency([paths['index.js']], {
      parseExtension: ['js']
    });
    expect(dependencies.length).toEqual(1);
  }
  {
    const dependencies = await dependency([paths['requires.js']], {
      parseExtension: ['js']
    });
    expect(dependencies.length).toEqual(2);
  }
});
