'use strict';

var splicer = require('stream-splicer'),
  concat = require('concat-stream');

exports.evaluate = function (streams, filename, input, callback) {
  var consoleError = console.error,
    errors = [];

  console.error = function (error) {
    errors.push(error);
  };

  splicer
    .obj(streams)
    .pipe(concat(function (result) {
      console.error = consoleError;
      callback(result, errors);
    }));

  streams[0].end({
    file: filename,
    source: input instanceof Function ? '(' + input.toString() + ')' : input
  });
};
