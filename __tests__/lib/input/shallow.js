'use strict';

var path = require('path'), shallow = require('../../../lib/input/shallow');

describe('shallow', function () {
  it('shallow deps', function () {
    return shallow([path.resolve(path.join(__dirname, '../../fixture/es6.input.js'))], {}).then(deps => {
      expect(deps.length).toBe(1);
      expect(deps[0]).toBeTruthy();
    });
  });

  it('shallow deps multi', function () {
    return shallow([
      path.resolve(path.join(__dirname, '../../fixture/es6.input.js')),
      path.resolve(path.join(__dirname, '../../fixture/event.input.js'))
    ], {}).then(deps => {
      expect(deps.length).toBe(2);
      expect(deps[0]).toBeTruthy();
    });
  });

  it('shallow deps directory', function () {
    return shallow([
      path.resolve(path.join(__dirname, '../../fixture/html'))
    ], {}).then(deps => {
      expect(deps.length).toBe(1);
      expect(deps[0].file.match(/input.js/)).toBeTruthy();
    });
  });

  it('throws on non-string or object input', function () {
    return shallow([
      true
    ], {}).catch(err => {
      expect(err.message).toBe('Indexes should be either strings or objects');
    });
  });

  it('shallow deps literal', function () {
    var obj = {
      file: 'foo.js',
      source: '//bar'
    };
    return shallow([
      obj
    ], {}).then(deps => {
      expect(deps[0]).toBe(obj);
    });
  });
});
