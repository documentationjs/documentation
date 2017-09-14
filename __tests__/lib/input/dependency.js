var os = require('os');
var shell = require('shelljs');
var path = require('path');
var fs = require('fs');
var dependency = require('../../../src/input/dependency');

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

test('dependency', async function() {
  let { paths, cleanup } = inputs({
    'index.js': 'module.exports = 1;',
    'requires.js': "module.exports = require('./foo');",
    'foo.js': 'module.exports = 2;'
  });
  {
    let dependencies = await dependency([paths['index.js']], {
      parseExtension: ['js']
    });
    expect(dependencies.length).toEqual(1);
  }
  {
    let dependencies = await dependency([paths['requires.js']], {
      parseExtension: ['js']
    });
    expect(dependencies.length).toEqual(2);
  }
});
