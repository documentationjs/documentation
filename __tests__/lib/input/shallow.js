var path = require('path'), shallow = require('../../../src/input/shallow');

test('shallow deps', async function() {
  const deps = await shallow(
    [path.resolve(path.join(__dirname, '../../fixture/es6.input.js'))],
    {}
  );
  expect(deps.length).toBe(1);
  expect(deps[0]).toBeTruthy();
});

test('shallow deps multi', async function() {
  const deps = await shallow(
    [
      path.resolve(path.join(__dirname, '../../fixture/es6.input.js')),
      path.resolve(path.join(__dirname, '../../fixture/simple.input.js'))
    ],
    {}
  );
  expect(deps.length).toBe(2);
  expect(deps[0]).toBeTruthy();
});

test('shallow deps directory', async function() {
  const deps = await shallow(
    [path.resolve(path.join(__dirname, '../../fixture/html'))],
    {}
  );
  expect(deps.length).toBe(1);
  expect(deps[0].file.match(/input.js/)).toBeTruthy();
});

test('throws on non-string or object input', function() {
  return shallow([true], {}).catch(err => {
    expect(err.message).toBe('Indexes should be either strings or objects');
  });
});

test('shallow deps literal', async function() {
  var obj = {
    file: 'foo.js',
    source: '//bar'
  };
  const deps = await shallow([obj], {});
  expect(deps[0]).toBe(obj);
});
