'use strict';

var path = require('path'), shallow = require('../../../lib/input/shallow');

it('shallow deps', function (done) {
  shallow([path.resolve(path.join(__dirname, '../../fixture/es6.input.js'))], {}).then(deps => {
    expect(deps.length).toBe(1);
    expect(deps[0]).toBeTruthy();
    done();
  });
});

it('shallow deps multi', function (done) {
  shallow([
    path.resolve(path.join(__dirname, '../../fixture/es6.input.js')),
    path.resolve(path.join(__dirname, '../../fixture/es6.output.json'))
  ], {}).then(deps => {
    expect(deps.length).toBe(2);
    expect(deps[0]).toBeTruthy();
    done();
  });
});

it('shallow deps directory', function (done) {
  shallow([
    path.resolve(path.join(__dirname, '../../fixture/html'))
  ], {}).then(deps => {
    expect(deps.length).toBe(1);
    expect(deps[0].file.match(/input.js/)).toBeTruthy();
    done();
  }).catch(err => {
    done.fail(err);
    done();
  });
});

it('throws on non-string or object input', function (done) {
  shallow([
    true
  ], {}).catch(err => {
    expect(err.message).toBe('Indexes should be either strings or objects');
    done();
  });
});

it('shallow deps literal', function (done) {
  var obj = {
    file: 'foo.js',
    source: '//bar'
  };
  shallow([
    obj
  ], {}).then(deps => {
    expect(deps[0]).toBe(obj);
    done();
  });
});
