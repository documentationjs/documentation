'use strict';

var test = require('tap').test,
  concat = require('concat-stream'),
  path = require('path'),
  shallow = require('../../streams/input/shallow'),
  polyglot = require('../../streams/parsers/polyglot');

test('polyglot', function (t) {
  shallow([path.resolve(path.join(__dirname, '../fixture/polyglot/blend.cpp'))])
    .pipe(polyglot())
    .pipe(concat(function (comments) {
      t.equal(comments.length, 1);
      t.equal(comments[0].description, 'This method moves a hex to a color');
      t.end();
    }));
});
